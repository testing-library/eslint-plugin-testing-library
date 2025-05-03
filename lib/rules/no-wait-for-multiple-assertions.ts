import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getPropertyIdentifierNode,
	isExpressionStatement,
} from '../node-utils';

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
	},
	defaultOptions: [],
	create(context, _, helpers) {
		function getExpectNodes(
			body: Array<TSESTree.Node>
		): Array<TSESTree.ExpressionStatement> {
			return body.filter((node) => {
				if (!isExpressionStatement(node)) {
					return false;
				}

				const expressionIdentifier = getPropertyIdentifierNode(node);
				if (!expressionIdentifier) {
					return false;
				}

				return expressionIdentifier.name === 'expect';
			}) as Array<TSESTree.ExpressionStatement>;
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

			if (expectNodes.length <= 1) {
				return;
			}

			for (let i = 0; i < expectNodes.length; i++) {
				if (i !== 0) {
					context.report({
						node: expectNodes[i],
						messageId: 'noWaitForMultipleAssertion',
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
