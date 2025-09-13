import { createTestingLibraryRule } from '../create-testing-library-rule';
import { getDeepestIdentifierNode } from '../node-utils';
import { getSourceCode } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

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
				svelte: 'error',
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
			'AwaitExpression > CallExpression'(
				node: TSESTree.CallExpression & { parent: TSESTree.AwaitExpression }
			) {
				const awaitExpression = node.parent;
				const deepestIdentifierNode = getDeepestIdentifierNode(node);

				if (!deepestIdentifierNode) {
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
							const awaitToken =
								getSourceCode(context).getFirstToken(awaitExpression);

							return awaitToken ? fixer.remove(awaitToken) : null;
						},
					});
				}
			},
		};
	},
});
