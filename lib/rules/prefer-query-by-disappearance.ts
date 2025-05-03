import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getPropertyIdentifierNode,
	isArrowFunctionExpression,
	isCallExpression,
	isMemberExpression,
	isFunctionExpression,
	isExpressionStatement,
	isReturnStatement,
	isBlockStatement,
} from '../node-utils';

export const RULE_NAME = 'prefer-query-by-disappearance';
type MessageIds = 'preferQueryByDisappearance';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description:
				'Suggest using `queryBy*` queries when waiting for disappearance',
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
			preferQueryByDisappearance:
				'Prefer using queryBy* when waiting for disappearance',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		function isWaitForElementToBeRemoved(node: TSESTree.CallExpression) {
			const identifierNode = getPropertyIdentifierNode(node);

			if (!identifierNode) {
				return false;
			}

			return helpers.isAsyncUtil(identifierNode, ['waitForElementToBeRemoved']);
		}

		/**
		 * Checks if node is reportable (starts with "get" or "find") and if it is, reports it with `context.report()`.
		 *
		 * @param {TSESTree.Expression} node - Node to be tested
		 * @returns {Boolean} Boolean indicating if expression was reported
		 */
		function reportExpression(node: TSESTree.Expression): boolean {
			const argumentProperty = isMemberExpression(node)
				? getPropertyIdentifierNode(node.property)
				: getPropertyIdentifierNode(node);

			if (!argumentProperty) {
				return false;
			}

			if (
				helpers.isGetQueryVariant(argumentProperty) ||
				helpers.isFindQueryVariant(argumentProperty)
			) {
				context.report({
					node: argumentProperty,
					messageId: 'preferQueryByDisappearance',
				});
				return true;
			}
			return false;
		}

		function checkNonCallbackViolation(node: TSESTree.CallExpressionArgument) {
			if (!isCallExpression(node)) {
				return false;
			}

			if (
				!isMemberExpression(node.callee) &&
				!getPropertyIdentifierNode(node.callee)
			) {
				return false;
			}

			return reportExpression(node.callee);
		}

		function isReturnViolation(node: TSESTree.Statement) {
			if (!isReturnStatement(node) || !isCallExpression(node.argument)) {
				return false;
			}

			return reportExpression(node.argument.callee);
		}

		function isNonReturnViolation(node: TSESTree.Statement) {
			if (!isExpressionStatement(node) || !isCallExpression(node.expression)) {
				return false;
			}

			if (
				!isMemberExpression(node.expression.callee) &&
				!getPropertyIdentifierNode(node.expression.callee)
			) {
				return false;
			}

			return reportExpression(node.expression.callee);
		}

		function isStatementViolation(statement: TSESTree.Statement) {
			return isReturnViolation(statement) || isNonReturnViolation(statement);
		}

		function checkFunctionExpressionViolation(
			node: TSESTree.CallExpressionArgument
		) {
			if (!isFunctionExpression(node)) {
				return false;
			}

			return node.body.body.some((statement) =>
				isStatementViolation(statement)
			);
		}

		function isArrowFunctionBodyViolation(
			node: TSESTree.CallExpressionArgument
		) {
			if (!isArrowFunctionExpression(node) || !isBlockStatement(node.body)) {
				return false;
			}

			return node.body.body.some((statement) =>
				isStatementViolation(statement)
			);
		}

		function isArrowFunctionImplicitReturnViolation(
			node: TSESTree.CallExpressionArgument
		) {
			if (!isArrowFunctionExpression(node) || !isCallExpression(node.body)) {
				return false;
			}

			if (
				!isMemberExpression(node.body.callee) &&
				!getPropertyIdentifierNode(node.body.callee)
			) {
				return false;
			}

			return reportExpression(node.body.callee);
		}

		function checkArrowFunctionViolation(
			node: TSESTree.CallExpressionArgument
		) {
			return (
				isArrowFunctionBodyViolation(node) ||
				isArrowFunctionImplicitReturnViolation(node)
			);
		}

		function check(node: TSESTree.CallExpression) {
			if (!isWaitForElementToBeRemoved(node)) {
				return;
			}

			const argumentNode = node.arguments[0];

			checkNonCallbackViolation(argumentNode);
			checkArrowFunctionViolation(argumentNode);
			checkFunctionExpressionViolation(argumentNode);
		}

		return {
			CallExpression: check,
		};
	},
});
