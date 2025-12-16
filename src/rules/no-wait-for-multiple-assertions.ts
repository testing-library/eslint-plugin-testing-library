import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getPropertyIdentifierNode,
	isCallExpression,
	isMemberExpression,
} from '../node-utils';
import { getSourceCode } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

export const RULE_NAME = 'no-wait-for-multiple-assertions';
export type MessageIds = 'noWaitForMultipleAssertion';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow the use of multiple `expect` calls inside `waitFor`',
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
			noWaitForMultipleAssertion:
				'Avoid using multiple assertions within `waitFor` callback',
		},
		schema: [],
		fixable: 'code',
	},
	defaultOptions: [],
	create(context, _, helpers) {
		function getExpectNodes(
			body: Array<TSESTree.Node>
		): Array<TSESTree.ExpressionStatement> {
			return body.filter((node) => {
				const expressionIdentifier = getPropertyIdentifierNode(node);
				if (!expressionIdentifier) {
					return false;
				}

				return expressionIdentifier.name === 'expect';
			}) as Array<TSESTree.ExpressionStatement>;
		}

		function getExpectArgument(expression: TSESTree.Expression) {
			if (!isCallExpression(expression)) {
				return null;
			}

			const { callee } = expression;
			if (!isMemberExpression(callee)) {
				return null;
			}

			const { object } = callee;
			if (!isCallExpression(object) || object.arguments.length === 0) {
				return null;
			}

			return object.arguments[0];
		}

		function reportMultipleAssertion(node: TSESTree.BlockStatement) {
			if (!node.parent) {
				return;
			}
			const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
			const callExpressionIdentifier =
				getPropertyIdentifierNode(callExpressionNode);

			if (!callExpressionIdentifier) {
				return;
			}

			if (!helpers.isAsyncUtil(callExpressionIdentifier, ['waitFor'])) {
				return;
			}

			const expectNodes = getExpectNodes(node.body);

			const expectArgumentMap = new Map<
				string,
				TSESTree.ExpressionStatement[]
			>();

			for (const expectNode of expectNodes) {
				const argument = getExpectArgument(expectNode.expression);
				if (!argument) {
					continue;
				}

				const argumentText = getSourceCode(context).getText(argument);
				const existingNodes = expectArgumentMap.get(argumentText) ?? [];
				const newTargetNodes = [...existingNodes, expectNode];
				expectArgumentMap.set(argumentText, newTargetNodes);
			}

			for (const expressionStatements of expectArgumentMap.values()) {
				// Skip the first matched assertion; only report subsequent duplicates.
				for (const expressionStatement of expressionStatements.slice(1)) {
					context.report({
						node: expressionStatement,
						messageId: 'noWaitForMultipleAssertion',
						fix(fixer) {
							const sourceCode = getSourceCode(context);

							const lineStart = sourceCode.getIndexFromLoc({
								line: expressionStatement.loc.start.line,
								column: 0,
							});
							const lineEnd = sourceCode.getIndexFromLoc({
								line: expressionStatement.loc.end.line + 1,
								column: 0,
							});
							const lines = sourceCode.getText().split('\n');
							const line = lines[callExpressionNode.loc.start.line - 1];
							const indent = line?.match(/^\s*/)?.[0] ?? '';

							const expressionStatementLines = lines.slice(
								expressionStatement.loc.start.line - 1,
								expressionStatement.loc.end.line
							);
							const statementText = expressionStatementLines
								.join('\n')
								.trimStart();

							return [
								fixer.removeRange([lineStart, lineEnd]),
								fixer.insertTextAfter(
									callExpressionNode,
									`\n${indent}${statementText}`
								),
							];
						},
					});
				}
			}
		}

		return {
			'CallExpression > ArrowFunctionExpression > BlockStatement':
				reportMultipleAssertion,
			'CallExpression > FunctionExpression > BlockStatement':
				reportMultipleAssertion,
		};
	},
});
