import { TSESTree, ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
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

			if (innerFunction) {
				functionWrappersNames.push(getFunctionName(innerFunction));
			}
		}

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
					if (property.value.name !== property.key.name) {
						functionWrappersNames.push(property.value.name);
					}
				}
			}
		}

		const isDestructuredPropertyIdentifier = (node: TSESTree.Node): boolean => {
			return (
				ASTUtils.isIdentifier(node) && isObjectPattern(node.parent?.parent)
			);
		};

		const isVariableDeclaratorInitializer = (node: TSESTree.Node): boolean => {
			return ASTUtils.isVariableDeclarator(node.parent);
		};

		return {
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				if (isObjectPattern(node.id)) {
					detectDestructuredAsyncUtilWrapperAliases(node.id);
					return;
				}

				if (
					ASTUtils.isIdentifier(node.id) &&
					ASTUtils.isIdentifier(node.init) &&
					functionWrappersNames.includes(node.init.name)
				) {
					functionWrappersNames.push(node.id.name);
				}
			},
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				if (helpers.isAsyncUtil(node)) {
					// detect async query used within wrapper function for later analysis
					detectAsyncUtilWrapper(node);

					const closestCallExpression = findClosestCallExpressionNode(
						node,
						true
					);

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
								messageId: 'awaitAsyncUtil',
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
									messageId: 'awaitAsyncUtil',
									data: {
										name: node.name,
									},
								});
								return;
							}
						}
					}

					return;
				}

				if (
					functionWrappersNames.includes(node.name) &&
					!isDestructuredPropertyIdentifier(node) &&
					!isVariableDeclaratorInitializer(node)
				) {
					// check async queries used within a wrapper previously detected
					if (!isPromiseHandled(node)) {
						context.report({
							node,
							messageId: 'asyncUtilWrapper',
							data: { name: node.name },
						});
					}
				}
			},
		};
	},
});
