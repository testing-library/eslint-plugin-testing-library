import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	getPropertyIdentifierNode,
	getStatementCallExpression,
	isEmptyFunction,
	isExpressionStatement,
	isMemberExpression,
	isReturnStatement,
} from '../node-utils';
import { resolveToTestingLibraryFn } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

export const RULE_NAME = 'no-unnecessary-act';
export type MessageIds =
	| 'noUnnecessaryActEmptyFunction'
	| 'noUnnecessaryActTestingLibraryUtil';
export type Options = [{ isStrict: boolean }];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow wrapping Testing Library utils or empty callbacks in `act`',
			recommendedConfig: {
				dom: false,
				angular: false,
				react: 'error',
				vue: false,
				svelte: false,
				marko: 'error',
			},
		},
		messages: {
			noUnnecessaryActTestingLibraryUtil:
				'Avoid wrapping Testing Library util calls in `act`',
			noUnnecessaryActEmptyFunction: 'Avoid wrapping empty function in `act`',
		},
		schema: [
			{
				type: 'object',
				properties: {
					isStrict: {
						type: 'boolean',
					},
				},
				additionalProperties: false,
			},
		],
	},
	defaultOptions: [
		{
			isStrict: true,
		},
	],

	create(context, [{ isStrict = true }], helpers) {
		const userEventInstanceNames = new Set<string>();

		function getStatementIdentifier(statement: TSESTree.Statement) {
			const callExpression = getStatementCallExpression(statement);

			if (
				!callExpression &&
				!isExpressionStatement(statement) &&
				!isReturnStatement(statement)
			) {
				return null;
			}

			if (callExpression) {
				return getDeepestIdentifierNode(callExpression);
			}

			if (
				isExpressionStatement(statement) &&
				ASTUtils.isAwaitExpression(statement.expression)
			) {
				return getPropertyIdentifierNode(statement.expression.argument);
			}

			if (isReturnStatement(statement) && statement.argument) {
				return getPropertyIdentifierNode(statement.argument);
			}

			return null;
		}

		function hasUserEventInstanceName(identifier: TSESTree.Identifier) {
			if (!isMemberExpression(identifier.parent)) {
				return false;
			}

			const propertyIdentifier = getPropertyIdentifierNode(identifier.parent);
			return userEventInstanceNames.has(propertyIdentifier?.name ?? '');
		}

		function hasStatementReference(
			statements: TSESTree.Statement[],
			predicate: (identifier: TSESTree.Identifier) => boolean
		): boolean {
			return statements.some((statement) => {
				const identifier = getStatementIdentifier(statement);

				if (!identifier) {
					return false;
				}

				return predicate(identifier);
			});
		}

		/**
		 * Determines whether some call is non Testing Library related for a given list of statements.
		 */
		function hasSomeNonTestingLibraryCall(
			statements: TSESTree.Statement[]
		): boolean {
			return hasStatementReference(
				statements,
				(identifier) =>
					!helpers.isTestingLibraryUtil(identifier) &&
					!hasUserEventInstanceName(identifier)
			);
		}

		function hasTestingLibraryCall(statements: TSESTree.Statement[]) {
			return hasStatementReference(
				statements,
				(identifier) =>
					helpers.isTestingLibraryUtil(identifier) ||
					hasUserEventInstanceName(identifier)
			);
		}

		function checkNoUnnecessaryActFromBlockStatement(
			blockStatementNode: TSESTree.BlockStatement
		) {
			const functionNode = blockStatementNode.parent as
				| TSESTree.ArrowFunctionExpression
				| TSESTree.FunctionExpression
				| undefined;
			const callExpressionNode = functionNode?.parent as
				| TSESTree.CallExpression
				| undefined;

			if (!callExpressionNode || !functionNode) {
				return;
			}

			const identifierNode = getDeepestIdentifierNode(callExpressionNode);
			if (!identifierNode) {
				return;
			}

			if (!helpers.isActUtil(identifierNode)) {
				return;
			}

			if (isEmptyFunction(functionNode)) {
				context.report({
					node: identifierNode,
					messageId: 'noUnnecessaryActEmptyFunction',
				});
				return;
			}

			const shouldBeReported = isStrict
				? hasTestingLibraryCall(blockStatementNode.body)
				: !hasSomeNonTestingLibraryCall(blockStatementNode.body);

			if (shouldBeReported) {
				context.report({
					node: identifierNode,
					messageId: 'noUnnecessaryActTestingLibraryUtil',
				});
			}
		}

		function checkNoUnnecessaryActFromImplicitReturn(
			node: TSESTree.CallExpression
		) {
			const nodeIdentifier = getDeepestIdentifierNode(node);

			if (!nodeIdentifier) {
				return;
			}

			const parentCallExpression = node.parent?.parent as
				| TSESTree.CallExpression
				| undefined;

			if (!parentCallExpression) {
				return;
			}

			const identifierNode = getDeepestIdentifierNode(parentCallExpression);
			if (!identifierNode) {
				return;
			}

			if (!helpers.isActUtil(identifierNode)) {
				return;
			}

			if (!helpers.isTestingLibraryUtil(nodeIdentifier)) {
				return;
			}

			context.report({
				node: identifierNode,
				messageId: 'noUnnecessaryActTestingLibraryUtil',
			});
		}

		function registerUserEventInstance(
			node: TSESTree.CallExpression & { parent: TSESTree.VariableDeclarator }
		) {
			const propertyIdentifier = getPropertyIdentifierNode(node);
			const deepestIdentifier = getDeepestIdentifierNode(node);
			const testingLibraryFn = resolveToTestingLibraryFn(node, context);

			if (
				propertyIdentifier?.name === testingLibraryFn?.local &&
				deepestIdentifier?.name === 'setup' &&
				ASTUtils.isIdentifier(node.parent?.id)
			) {
				userEventInstanceNames.add(node.parent.id.name);
			}
		}

		return {
			'VariableDeclarator > CallExpression': registerUserEventInstance,
			'CallExpression > ArrowFunctionExpression > BlockStatement':
				checkNoUnnecessaryActFromBlockStatement,
			'CallExpression > FunctionExpression > BlockStatement':
				checkNoUnnecessaryActFromBlockStatement,
			'CallExpression > ArrowFunctionExpression > CallExpression':
				checkNoUnnecessaryActFromImplicitReturn,
		};
	},
});
