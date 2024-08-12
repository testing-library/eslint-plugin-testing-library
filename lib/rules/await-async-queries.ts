import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

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

export const RULE_NAME = 'await-async-queries';
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

					/**
					 * Check direct usage of async query:
					 * const element = await findByRole('button');
					 */
					if (references.length === 0) {
						if (!isPromiseHandled(identifierNode)) {
							context.report({
								node: identifierNode,
								messageId: 'awaitAsyncQuery',
								data: { name: identifierNode.name },
								fix: (fixer) => {
									if (
										isMemberExpression(identifierNode.parent) &&
										ASTUtils.isIdentifier(identifierNode.parent.object) &&
										identifierNode.parent.object.name === 'screen'
									) {
										return fixer.insertTextBefore(
											identifierNode.parent,
											'await '
										);
									}
									return fixer.insertTextBefore(identifierNode, 'await ');
								},
							});
							return;
						}
					}

					/**
					 * Check references usages of async query:
					 * const promise = findByRole('button');
					 * const element = await promise;
					 */
					for (const reference of references) {
						if (
							ASTUtils.isIdentifier(reference.identifier) &&
							!isPromiseHandled(reference.identifier)
						) {
							context.report({
								node: identifierNode,
								messageId: 'awaitAsyncQuery',
								data: { name: identifierNode.name },
								fix: (fixer) => {
									const fixes = references.map((ref) =>
										fixer.insertTextBefore(ref.identifier, 'await ')
									);
									return fixes;
								},
							});
							return;
						}
					}
				} else if (
					functionWrappersNames.includes(identifierNode.name) &&
					!isPromiseHandled(identifierNode)
				) {
					// Check async queries used within a wrapper previously detected
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

							if (functionExpression.async) {
								return IdentifierNodeFixer;
							} else {
								/**
								 * Mutate the actual node so if other nodes exist in this
								 * function expression body they don't also try to fix it.
								 */
								functionExpression.async = true;

								return [
									IdentifierNodeFixer,
									fixer.insertTextBefore(functionExpression, 'async '),
								];
							}
						},
					});
				}
			},
		};
	},
});
