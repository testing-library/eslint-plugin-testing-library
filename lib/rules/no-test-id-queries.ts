import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { ALL_QUERIES_VARIANTS } from '../utils';

export const RULE_NAME = 'no-test-id-queries';
export type MessageIds = 'noTestIdQueries';
type Options = [];

const QUERIES_REGEX = `/^(${ALL_QUERIES_VARIANTS.join('|')})TestId$/`;

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Ensure no `data-testid` queries are used',
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
			noTestIdQueries:
				'Using `data-testid` queries is not recommended. Use a more descriptive query instead.',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context) {
		return {
			[`CallExpression[callee.property.name=${QUERIES_REGEX}], CallExpression[callee.name=${QUERIES_REGEX}]`](
				node: TSESTree.CallExpression
			) {
				context.report({
					node,
					messageId: 'noTestIdQueries',
				});
			},
		};
	},
});
