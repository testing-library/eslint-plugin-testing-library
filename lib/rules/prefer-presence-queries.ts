import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { findClosestCallNode, isMemberExpression } from '../node-utils';

export const RULE_NAME = 'prefer-presence-queries';
export type MessageIds = 'wrongAbsenceQuery' | 'wrongPresenceQuery';
export type Options = [
	{
		presence?: boolean;
		absence?: boolean;
	},
];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		docs: {
			description:
				'Ensure appropriate `get*`/`query*` queries are used with their respective matchers',
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
			wrongPresenceQuery:
				'Use `getBy*` queries rather than `queryBy*` for checking element is present',
			wrongAbsenceQuery:
				'Use `queryBy*` queries rather than `getBy*` for checking element is NOT present',
		},
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					presence: {
						type: 'boolean',
					},
					absence: {
						type: 'boolean',
					},
				},
			},
		],
		type: 'suggestion',
	},
	defaultOptions: [
		{
			presence: true,
			absence: true,
		},
	],

	create(context, [{ absence = true, presence = true }], helpers) {
		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				const expectCallNode = findClosestCallNode(node, 'expect');
				const withinCallNode = findClosestCallNode(node, 'within');

				if (!expectCallNode || !isMemberExpression(expectCallNode.parent)) {
					return;
				}

				// Sync queries (getBy and queryBy) are corresponding ones used
				// to check presence or absence. If none found, stop the rule.
				if (!helpers.isSyncQuery(node)) {
					return;
				}

				const isPresenceQuery = helpers.isGetQueryVariant(node);
				const expectStatement = expectCallNode.parent;
				const isPresenceAssert = helpers.isPresenceAssert(expectStatement);
				const isAbsenceAssert = helpers.isAbsenceAssert(expectStatement);

				if (!isPresenceAssert && !isAbsenceAssert) {
					return;
				}

				if (
					presence &&
					(withinCallNode || isPresenceAssert) &&
					!isPresenceQuery
				) {
					context.report({ node, messageId: 'wrongPresenceQuery' });
				} else if (
					!withinCallNode &&
					absence &&
					isAbsenceAssert &&
					isPresenceQuery
				) {
					context.report({ node, messageId: 'wrongAbsenceQuery' });
				}
			},
		};
	},
});
