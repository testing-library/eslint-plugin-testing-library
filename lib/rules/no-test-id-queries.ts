import { TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';

export const RULE_NAME = 'no-test-id-queries';
export type MessageIds = 'noTestIdQueries';
type Options = [];

const QUERIES_REGEX = /^(get|query|getAll|queryAll|find|findAll)ByTestId$/;

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
			[`CallExpression[callee.property.name=${String(QUERIES_REGEX)}], CallExpression[callee.name=${String(QUERIES_REGEX)}]`](
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
