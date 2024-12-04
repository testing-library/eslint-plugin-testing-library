import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	isMemberExpression,
} from '../node-utils';

export const RULE_NAME = 'no-wait-for-snapshot';
export type MessageIds = 'noWaitForSnapshot';
type Options = [];

const SNAPSHOT_REGEXP = /^(toMatchSnapshot|toMatchInlineSnapshot)$/;

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description:
				'Ensures no snapshot is generated inside of a `waitFor` call',
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
			noWaitForSnapshot:
				"A snapshot can't be generated inside of a `{{ name }}` call",
		},
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		function getClosestAsyncUtil(
			node: TSESTree.Node
		): TSESTree.Identifier | null {
			let n: TSESTree.Node | null = node;
			do {
				const callExpression = findClosestCallExpressionNode(n);

				if (!callExpression) {
					return null;
				}

				if (
					ASTUtils.isIdentifier(callExpression.callee) &&
					helpers.isAsyncUtil(callExpression.callee)
				) {
					return callExpression.callee;
				}
				if (
					isMemberExpression(callExpression.callee) &&
					ASTUtils.isIdentifier(callExpression.callee.property) &&
					helpers.isAsyncUtil(callExpression.callee.property)
				) {
					return callExpression.callee.property;
				}
				if (callExpression.parent) {
					n = findClosestCallExpressionNode(callExpression.parent);
				}
			} while (n !== null);
			return null;
		}

		return {
			[`Identifier[name=${String(SNAPSHOT_REGEXP)}]`](
				node: TSESTree.Identifier
			) {
				const closestAsyncUtil = getClosestAsyncUtil(node);
				if (closestAsyncUtil === null) {
					return;
				}
				context.report({
					node,
					messageId: 'noWaitForSnapshot',
					data: { name: closestAsyncUtil.name },
				});
			},
		};
	},
});
