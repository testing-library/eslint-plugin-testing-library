import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	getDeepestIdentifierNode,
	getFunctionName,
	getInnermostReturningFunction,
	getVariableReferences,
	isPromiseHandled,
	isMemberExpression,
	isCallExpression,
} from '../node-utils';

export const RULE_NAME = 'await-async-query';
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
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		const functionWrappersNamesSync: string[] = [];
		const functionWrappersNamesAsync: string[] = [];

		function detectSyncQueryWrapper(node: TSESTree.Identifier) {
			const innerFunction = getInnermostReturningFunction(context, node);
			if (innerFunction) {
				functionWrappersNamesSync.push(getFunctionName(innerFunction));
			}
		}

		function detectAsyncQueryWrapper(node: TSESTree.Identifier) {
			const innerFunction = getInnermostReturningFunction(context, node);
			if (innerFunction) {
				functionWrappersNamesAsync.push(getFunctionName(innerFunction));
			}
		}

		function resolveVariable(
			node: TSESTree.Node,
			scope: ReturnType<typeof context['getScope']> | null
		): TSESTree.Node | null {
			if (scope == null) {
				return null;
			}

			if (node.type === 'Identifier') {
				const variable = scope.variables.find(({ name }) => name === node.name);

				// variable not found in this scope, so recursively check parent scope(s) for definition
				if (variable == null) {
					return resolveVariable(node, scope.upper);
				}

				if (variable.defs.length === 0) {
					return null;
				}

				const result = variable.defs[variable.defs.length - 1].node;

				if (!ASTUtils.isVariableDeclarator(result)) {
					return null;
				}

				return result.init;
			}

			return node;
		}

		// true in cases like:
		// - getByText('foo').findByType(SomeType)
		// - (await findByText('foo')).findByType(SomeType)
		// - const variable = await findByText('foo'); variable.findByType(SomeType)
		// - function helper() { return screen.getByText('foo'); }; helper().findByType(SomeType)
		function hasQueryResultInChain(node: TSESTree.Node): boolean {
			if (ASTUtils.isIdentifier(node)) {
				return false;
			}

			if (ASTUtils.isAwaitExpression(node)) {
				// great, we have an inline await, so let's check if it's a query
				const identifierNode = getDeepestIdentifierNode(node);

				if (!identifierNode) {
					return false;
				}

				if (
					helpers.isAsyncQuery(identifierNode) &&
					isPromiseHandled(identifierNode)
				) {
					return true;
				}

				if (
					functionWrappersNamesAsync.includes(identifierNode.name) &&
					isPromiseHandled(identifierNode)
				) {
					return true;
				}

				return false;
			}

			if (isMemberExpression(node)) {
				// check inline sync query (e.g. foo.getByText(...) checks `getByText`)
				if (
					ASTUtils.isIdentifier(node.property) &&
					helpers.isSyncQuery(node.property)
				) {
					return true;
				}

				// check sync query reference (e.g. foo.getByText(...) checks `foo` is defined elsewhere)
				if (ASTUtils.isIdentifier(node.object)) {
					const definition = resolveVariable(node.object, context.getScope());

					if (definition == null) {
						return false;
					}

					return hasQueryResultInChain(definition);
				}

				// check sync query reference (e.g. foo().getByText(...) checks `foo` is defined elsewhere)
				if (isCallExpression(node.object)) {
					if (
						ASTUtils.isIdentifier(node.object.callee) &&
						functionWrappersNamesSync.includes(node.object.callee.name)
					) {
						return true;
					}
				}

				return hasQueryResultInChain(node.object);
			}

			if (isCallExpression(node)) {
				return hasQueryResultInChain(node.callee);
			}

			return false;
		}

		return {
			CallExpression(node) {
				const identifierNode = getDeepestIdentifierNode(node);

				if (!identifierNode) {
					return;
				}

				if (helpers.isSyncQuery(identifierNode)) {
					detectSyncQueryWrapper(identifierNode);
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

					// check chained usage for an instance of sync query, which means this might be a false positive from react-test-renderer
					if (hasQueryResultInChain(closestCallExpressionNode)) {
						return;
					}

					const references = getVariableReferences(
						context,
						closestCallExpressionNode.parent
					);

					// check direct usage of async query:
					// const element = await findByRole('button')
					if (references.length === 0) {
						if (!isPromiseHandled(identifierNode)) {
							context.report({
								node: identifierNode,
								messageId: 'awaitAsyncQuery',
								data: { name: identifierNode.name },
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
							});
							return;
						}
					}
				} else if (
					functionWrappersNamesAsync.includes(identifierNode.name) &&
					!isPromiseHandled(identifierNode)
				) {
					// check async queries used within a wrapper previously detected
					context.report({
						node: identifierNode,
						messageId: 'asyncQueryWrapper',
						data: { name: identifierNode.name },
					});
				}
			},
		};
	},
});
