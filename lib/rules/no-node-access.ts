import { TSESTree, ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	ALL_RETURNING_NODES,
	EVENT_HANDLER_METHODS,
	EVENTS_SIMULATORS,
} from '../utils';

export const RULE_NAME = 'no-node-access';
export type MessageIds = 'noNodeAccess';
export type Options = [{ allowContainerFirstChild: boolean }];

const ALL_PROHIBITED_MEMBERS = [
	...ALL_RETURNING_NODES,
	...EVENT_HANDLER_METHODS,
] as const;

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow direct Node access',
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
			noNodeAccess:
				'Avoid direct Node access. Prefer using the methods from Testing Library.',
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowContainerFirstChild: {
						type: 'boolean',
					},
				},
			},
		],
	},
	defaultOptions: [
		{
			allowContainerFirstChild: false,
		},
	],

	create(context, [{ allowContainerFirstChild = false }], helpers) {
		function showErrorForNodeAccess(node: TSESTree.MemberExpression) {
			// This rule is so aggressive that can cause tons of false positives outside test files when Aggressive Reporting
			// is enabled. Because of that, this rule will skip this mechanism and report only if some Testing Library package
			// or custom one (set in utils-module Shared Setting) is found.
			if (!helpers.isTestingLibraryImported(true)) {
				return;
			}

			const propertyName = ASTUtils.isIdentifier(node.property)
				? node.property.name
				: null;

			const objectName = ASTUtils.isIdentifier(node.object)
				? node.object.name
				: null;
			if (
				propertyName &&
				ALL_PROHIBITED_MEMBERS.some(
					(allReturningNode) => allReturningNode === propertyName
				) &&
				![
					...EVENTS_SIMULATORS,
					// TODO: As discussed in https://github.com/testing-library/eslint-plugin-testing-library/issues/1024, this is just a temporary workaround.
					// We should address the root cause and implement a proper solution instead of explicitly excluding 'user' here.
					'user',
				].some((simulator) => simulator === objectName)
			) {
				if (allowContainerFirstChild && propertyName === 'firstChild') {
					return;
				}

				if (
					ASTUtils.isIdentifier(node.object) &&
					node.object.name === 'props'
				) {
					return;
				}

				context.report({
					node,
					loc: node.property.loc.start,
					messageId: 'noNodeAccess',
				});
			}
		}

		return {
			'ExpressionStatement MemberExpression': showErrorForNodeAccess,
			'VariableDeclarator MemberExpression': showErrorForNodeAccess,
		};
	},
});
