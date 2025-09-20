import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	findClosestFunctionExpressionNode,
	getDeepestIdentifierNode,
	getFunctionName,
	getInnermostReturningFunction,
	getReferenceNode,
	getVariableReferences,
	isCallExpression,
	isObjectPattern,
	isPromiseHandled,
	isProperty,
} from '../node-utils';

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
		fixable: 'code',
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
		function wrapWithFunctionExpressionFix(
			fixer: TSESLint.RuleFixer,
			ruleFix: TSESLint.RuleFix,
			functionExpression:
				| TSESTree.ArrowFunctionExpression
				| TSESTree.FunctionDeclaration
				| TSESTree.FunctionExpression
				| null
		) {
			if (functionExpression && !functionExpression.async) {
				/**
				 * Mutate the actual node so if other nodes exist in this
				 * function expression body they don't also try to fix it.
				 */
				functionExpression.async = true;

				return [ruleFix, fixer.insertTextBefore(functionExpression, 'async ')];
			}
			return ruleFix;
		}

		function insertAwaitBeforeNode(
			fixer: TSESLint.RuleFixer,
			node: TSESTree.Node
		) {
			return fixer.insertTextBefore(node, 'await ');
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
					!isCallExpression(node.init) &&
					!ASTUtils.isAwaitExpression(node.init) &&
					functionWrappersNames.includes(
						getDeepestIdentifierNode(node.init)?.name ?? ''
					);

				if (isAssigningKnownAsyncFunctionWrapper) {
					functionWrappersNames.push((node.id as TSESTree.Identifier).name);
				}
			},
			CallExpression(node: TSESTree.CallExpression) {
				const callExpressionIdentifier = getDeepestIdentifierNode(node);

				if (!callExpressionIdentifier) {
					return;
				}

				const isAsyncUtilOrKnownAliasAroundIt =
					helpers.isAsyncUtil(callExpressionIdentifier) ||
					functionWrappersNames.includes(callExpressionIdentifier.name);
				if (!isAsyncUtilOrKnownAliasAroundIt) {
					return;
				}

				// detect async query used within wrapper function for later analysis
				if (helpers.isAsyncUtil(callExpressionIdentifier)) {
					detectAsyncUtilWrapper(callExpressionIdentifier);
				}

				const closestCallExpression = findClosestCallExpressionNode(
					callExpressionIdentifier,
					true
				);

				if (!closestCallExpression?.parent) {
					return;
				}

				const references = getVariableReferences(
					context,
					closestCallExpression.parent
				);
				const functionExpression = findClosestFunctionExpressionNode(node);

				if (references.length === 0) {
					if (!isPromiseHandled(callExpressionIdentifier)) {
						context.report({
							node: callExpressionIdentifier,
							messageId: getMessageId(callExpressionIdentifier),
							data: {
								name: callExpressionIdentifier.name,
							},
							fix: (fixer) => {
								const referenceNode = getReferenceNode(
									callExpressionIdentifier
								);
								const awaitFix = insertAwaitBeforeNode(fixer, referenceNode);
								return wrapWithFunctionExpressionFix(
									fixer,
									awaitFix,
									functionExpression
								);
							},
						});
					}
				} else {
					for (const reference of references) {
						const referenceNode = reference.identifier as TSESTree.Identifier;
						if (!isPromiseHandled(referenceNode)) {
							context.report({
								node: callExpressionIdentifier,
								messageId: getMessageId(callExpressionIdentifier),
								data: {
									name: callExpressionIdentifier.name,
								},
								fix: (fixer) => {
									const awaitFix = insertAwaitBeforeNode(fixer, referenceNode);
									return wrapWithFunctionExpressionFix(
										fixer,
										awaitFix,
										functionExpression
									);
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
