import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { findClosestCallNode, isMemberExpression } from '../node-utils';

export const RULE_NAME = 'prefer-query-matchers';
export type MessageIds = 'wrongQueryForMatcher';
export type Options = [
	{
		validEntries: {
			query: 'get' | 'query';
			matcher: string;
		}[];
	},
];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		docs: {
			description:
				'Ensure the configured `get*`/`query*` query is used with the corresponding matchers',
			recommendedConfig: {
				dom: false,
				angular: false,
				react: false,
				vue: false,
				svelte: false,
				marko: false,
			},
		},
		messages: {
			wrongQueryForMatcher: 'Use `{{ query }}By*` queries for {{ matcher }}',
		},
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					validEntries: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								query: {
									type: 'string',
									enum: ['get', 'query'],
								},
								matcher: {
									type: 'string',
								},
							},
						},
					},
				},
			},
		],
		type: 'suggestion',
	},
	defaultOptions: [
		{
			validEntries: [],
		},
	],

	create(context, [{ validEntries }], helpers) {
		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				const expectCallNode = findClosestCallNode(node, 'expect');

				if (!expectCallNode || !isMemberExpression(expectCallNode.parent)) {
					return;
				}

				// Sync queries (getBy and queryBy) and corresponding ones
				// are supported. If none found, stop the rule.
				if (!helpers.isSyncQuery(node)) {
					return;
				}

				const isGetBy = helpers.isGetQueryVariant(node);
				const expectStatement = expectCallNode.parent;
				for (const entry of validEntries) {
					const { query, matcher } = entry;
					const isMatchingAssertForThisEntry = helpers.isMatchingAssert(
						expectStatement,
						matcher
					);

					if (!isMatchingAssertForThisEntry) {
						continue;
					}

					const actualQuery = isGetBy ? 'get' : 'query';
					if (query !== actualQuery) {
						context.report({
							node,
							messageId: 'wrongQueryForMatcher',
							data: { query, matcher },
						});
					}
				}
			},
		};
	},
});
