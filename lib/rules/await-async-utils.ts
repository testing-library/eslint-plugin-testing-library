import { TSESTree, ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	getDeepestIdentifierNode,
	getFunctionName,
	getInnermostReturningFunction,
	getVariableReferences,
	isObjectPattern,
	isPromiseHandled,
	isProperty,
} from '../node-utils';

export const RULE_NAME = 'await-async-utils';
export type MessageIds = 'asyncUtilWrapper' | 'awaitAsyncUtil';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce promises from async utils to be awaited properly',
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
			awaitAsyncUtil: 'Promise returned from `{{ name }}` must be handled',
			asyncUtilWrapper:
				'Promise returned from {{ name }} wrapper over async util must be handled',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		const functionWrappersNames: string[] = [];

		function detectAsyncUtilWrapper(node: TSESTree.Identifier) {
			const innerFunction = getInnermostReturningFunction(context, node);
			if (!innerFunction) {
				return;
			}

			const functionName = getFunctionName(innerFunction);
			if (functionName.length === 0) {
				return;
			}

			functionWrappersNames.push(functionName);
		}

		/*
			Example:
			`const { myAsyncWrapper: myRenamedValue } = someObject`;
			Detects `myRenamedValue` and adds it to the known async wrapper names.
		 */
		function detectDestructuredAsyncUtilWrapperAliases(
			node: TSESTree.ObjectPattern
		) {
			for (const property of node.properties) {
				if (!isProperty(property)) {
					continue;
				}

				if (
					!ASTUtils.isIdentifier(property.key) ||
					!ASTUtils.isIdentifier(property.value)
				) {
					continue;
				}

				if (functionWrappersNames.includes(property.key.name)) {
					const isDestructuredAsyncWrapperPropertyRenamed =
						property.key.name !== property.value.name;

					if (isDestructuredAsyncWrapperPropertyRenamed) {
						functionWrappersNames.push(property.value.name);
					}
				}
			}
		}

		/*
			Either we report a direct usage of an async util or a usage of a wrapper
			around an async util
		 */
		const getMessageId = (node: TSESTree.Identifier): MessageIds => {
			if (helpers.isAsyncUtil(node)) {
				return 'awaitAsyncUtil';
			}

			return 'asyncUtilWrapper';
		};

		return {
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				if (isObjectPattern(node.id)) {
					detectDestructuredAsyncUtilWrapperAliases(node.id);
					return;
				}

				const isAssigningKnownAsyncFunctionWrapper =
					ASTUtils.isIdentifier(node.id) &&
					node.init !== null &&
					functionWrappersNames.includes(
						getDeepestIdentifierNode(node.init)?.name ?? ''
					);

				if (isAssigningKnownAsyncFunctionWrapper) {
					functionWrappersNames.push((node.id as TSESTree.Identifier).name);
				}
			},
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				const isAsyncUtilOrKnownAliasAroundIt =
					helpers.isAsyncUtil(node) ||
					functionWrappersNames.includes(node.name);
				if (!isAsyncUtilOrKnownAliasAroundIt) {
					return;
				}

				// detect async query used within wrapper function for later analysis
				if (helpers.isAsyncUtil(node)) {
					detectAsyncUtilWrapper(node);
				}

				const closestCallExpression = findClosestCallExpressionNode(node, true);

				if (!closestCallExpression?.parent) {
					return;
				}

				const references = getVariableReferences(
					context,
					closestCallExpression.parent
				);

				if (references.length === 0) {
					if (!isPromiseHandled(node)) {
						context.report({
							node,
							messageId: getMessageId(node),
							data: {
								name: node.name,
							},
						});
					}
				} else {
					for (const reference of references) {
						const referenceNode = reference.identifier as TSESTree.Identifier;
						if (!isPromiseHandled(referenceNode)) {
							context.report({
								node,
								messageId: getMessageId(node),
								data: {
									name: node.name,
								},
							});
							return;
						}
					}
				}
			},
		};
	},
});
