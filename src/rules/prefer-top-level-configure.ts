import { ScopeType } from '@typescript-eslint/scope-manager';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { getDeepestIdentifierNode } from '../node-utils';
import { resolveToTestingLibraryFn } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'prefer-top-level-configure';
const CONFIGURE_NAME = 'configure';
export type MessageIds = 'preferTopLevelConfigure';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description:
				'Prefer calling Testing Library `configure` at the top level',
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
			preferTopLevelConfigure:
				'Call Testing Library `configure` at the top level of the module.',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context) {
		return {
			CallExpression(node: TSESTree.CallExpression) {
				const resolvedConfigure = resolveToTestingLibraryFn(node, context);
				if (resolvedConfigure?.original !== CONFIGURE_NAME) {
					return;
				}

				const scope = context.sourceCode.getScope(node);
				if (
					scope.type === ScopeType.global ||
					scope.type === ScopeType.module
				) {
					return;
				}

				const configureNode = getDeepestIdentifierNode(node) ?? node.callee;

				context.report({
					node: configureNode,
					messageId: 'preferTopLevelConfigure',
				});
			},
		};
	},
});
