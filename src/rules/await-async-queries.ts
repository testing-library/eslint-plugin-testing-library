import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	findClosestFunctionExpressionNode,
	getDeepestIdentifierNode,
	getFunctionName,
	getInnermostReturningFunction,
	getVariableReferences,
	isMemberExpression,
	isPromiseHandled,
} from '../node-utils';
import { getSourceCode } from '../utils';
import { addAsyncToFunctionFix } from '../utils/add-async-to-function-fix';

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'await-async-queries';
export type MessageIds = 'asyncQueryWrapper' | 'awaitAsyncQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce promises from async queries to be handled',
			recommendedConfig: {
				dom: 'error',
				angular: 'error',
				react: 'error',
				vue: 'error',
				svelte: 'error',
				marko: 'error',
			},
		},
		messages: {
			awaitAsyncQuery:
				'promise returned from `{{ name }}` query must be handled',
			asyncQueryWrapper:
				'promise returned from `{{ name }}` wrapper over async query must be handled',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		const functionWrappersNames: string[] = [];

		function detectAsyncQueryWrapper(node: TSESTree.Identifier) {
			const innerFunction = getInnermostReturningFunction(context, node);
			if (innerFunction) {
				functionWrappersNames.push(getFunctionName(innerFunction));
			}
		}

		/**
		 * Method function nodes start at the parameter list. `async` belongs
		 * before the method name, or before `*` on a generator method.
		 */
		function getNodeToInsertAsyncBefore(
			functionNode:
				| TSESTree.ArrowFunctionExpression
				| TSESTree.FunctionDeclaration
				| TSESTree.FunctionExpression
				| null
		): TSESTree.Node | TSESTree.Token | null {
			if (!functionNode?.parent) {
				return null;
			}

			const parent = functionNode.parent;
			const isClassMethod =
				parent.type === AST_NODE_TYPES.MethodDefinition &&
				parent.kind === 'method' &&
				parent.value === functionNode;
			const isObjectMethod =
				parent.type === AST_NODE_TYPES.Property &&
				parent.method &&
				parent.value === functionNode;

			if (!isClassMethod && !isObjectMethod) {
				return null;
			}

			const methodKey = parent.key;

			if (
				functionNode.type === AST_NODE_TYPES.FunctionExpression &&
				functionNode.generator
			) {
				const tokenBeforeKey = getSourceCode(context).getTokenBefore(methodKey);
				if (tokenBeforeKey?.value === '*') {
					return tokenBeforeKey;
				}
			}

			return methodKey;
		}

		function fixAwaitAndMakeFunctionAsync(
			fixer: TSESLint.RuleFixer,
			awaitFixes: TSESLint.RuleFix[],
			functionExpression:
				| TSESTree.ArrowFunctionExpression
				| TSESTree.FunctionDeclaration
				| TSESTree.FunctionExpression
				| null
		) {
			const firstAwaitFix = awaitFixes[0];

			if (!firstAwaitFix) {
				return null;
			}

			const fixes = addAsyncToFunctionFix(
				fixer,
				firstAwaitFix,
				functionExpression,
				getNodeToInsertAsyncBefore(functionExpression)
			);

			if (awaitFixes.length === 1) {
				return fixes;
			}

			return [
				...(Array.isArray(fixes) ? fixes : [fixes]),
				...awaitFixes.slice(1),
			];
		}

		return {
			CallExpression(node) {
				const identifierNode = getDeepestIdentifierNode(node);

				if (!identifierNode) {
					return;
				}

				if (helpers.isAsyncQuery(identifierNode)) {
					// detect async query used within wrapper function for later analysis
					detectAsyncQueryWrapper(identifierNode);

					const closestCallExpressionNode = findClosestCallExpressionNode(
						node,
						true
					);

					if (!closestCallExpressionNode?.parent) {
						return;
					}

					const references = getVariableReferences(
						context,
						closestCallExpressionNode.parent
					);
					const functionExpression = findClosestFunctionExpressionNode(node);

					// check direct usage of async query:
					// const element = await findByRole('button')
					if (references.length === 0) {
						if (!isPromiseHandled(identifierNode)) {
							context.report({
								node: identifierNode,
								messageId: 'awaitAsyncQuery',
								data: { name: identifierNode.name },
								fix: (fixer) => {
									const awaitTarget =
										isMemberExpression(identifierNode.parent) &&
										ASTUtils.isIdentifier(identifierNode.parent.object)
											? identifierNode.parent
											: identifierNode;

									return fixAwaitAndMakeFunctionAsync(
										fixer,
										[fixer.insertTextBefore(awaitTarget, 'await ')],
										functionExpression
									);
								},
							});
							return;
						}
					}

					// check references usages of async query:
					//  const promise = findByRole('button')
					//  const element = await promise
					for (const reference of references) {
						if (
							ASTUtils.isIdentifier(reference.identifier) &&
							!isPromiseHandled(reference.identifier)
						) {
							context.report({
								node: identifierNode,
								messageId: 'awaitAsyncQuery',
								data: { name: identifierNode.name },
								fix: (fixer) =>
									fixAwaitAndMakeFunctionAsync(
										fixer,
										references.map((ref) =>
											fixer.insertTextBefore(ref.identifier, 'await ')
										),
										functionExpression
									),
							});
							return;
						}
					}
				} else if (
					functionWrappersNames.includes(identifierNode.name) &&
					!isPromiseHandled(identifierNode)
				) {
					// check async queries used within a wrapper previously detected
					context.report({
						node: identifierNode,
						messageId: 'asyncQueryWrapper',
						data: { name: identifierNode.name },
						fix: (fixer) => {
							const functionExpression =
								findClosestFunctionExpressionNode(node);

							if (!functionExpression) return null;

							let IdentifierNodeFixer;
							if (isMemberExpression(identifierNode.parent)) {
								/**
								 * If the wrapper is a property of an object,
								 * add 'await' before the object, e.g.:
								 * const obj = { wrapper: () => screen.findByText(/foo/i) };
								 * await obj.wrapper();
								 */
								IdentifierNodeFixer = fixer.insertTextBefore(
									identifierNode.parent,
									'await '
								);
							} else {
								/**
								 * Add 'await' before the wrapper function, e.g.:
								 * const wrapper = () => screen.findByText(/foo/i);
								 * await wrapper();
								 */
								IdentifierNodeFixer = fixer.insertTextBefore(
									identifierNode,
									'await '
								);
							}

							return addAsyncToFunctionFix(
								fixer,
								IdentifierNodeFixer,
								functionExpression,
								getNodeToInsertAsyncBefore(functionExpression)
							);
						},
					});
				}
			},
		};
	},
});
