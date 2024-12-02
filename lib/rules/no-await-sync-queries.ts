import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { getDeepestIdentifierNode } from '../node-utils';

export const RULE_NAME = 'no-await-sync-queries';
export type MessageIds = 'noAwaitSyncQuery';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow unnecessary `await` for sync queries',
			recommendedConfig: {
				dom: 'error',
				angular: 'error',
				react: 'error',
				vue: 'error',
				marko: 'error',
			},
		},
		messages: {
			noAwaitSyncQuery:
				'`{{ name }}` query is sync so it does not need to be awaited',
		},
		schema: [],
		fixable: 'code',
	},
	defaultOptions: [],

	create(context, _, helpers) {
		return {
			'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
				const awaitExpression = node.parent;
				const deepestIdentifierNode = getDeepestIdentifierNode(node);

				if (
					!ASTUtils.isAwaitExpression(awaitExpression) ||
					!deepestIdentifierNode
				) {
					return;
				}

				if (helpers.isSyncQuery(deepestIdentifierNode)) {
					context.report({
						node: deepestIdentifierNode,
						messageId: 'noAwaitSyncQuery',
						data: {
							name: deepestIdentifierNode.name,
						},
						fix: (fixer) => {
							const awaitRangeStart = awaitExpression.range[0];
							const awaitRangeEnd = awaitExpression.range[0] + 'await'.length;

							return fixer.replaceTextRange(
								[awaitRangeStart, awaitRangeEnd],
								''
							);
						},
					});
				}
			},
		};
	},
});
