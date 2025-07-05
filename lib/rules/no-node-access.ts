import { TSESTree, ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { isCallExpression, isMemberExpression } from '../node-utils';
import {
	ALL_RETURNING_NODES,
	EVENT_HANDLER_METHODS,
	resolveToTestingLibraryFn,
} from '../utils';

export const RULE_NAME = 'no-node-access';
export type MessageIds = 'noNodeAccess';
export type Options = [{ allowContainerFirstChild: boolean }];

const userEventInstanceNames = new Set<string>();

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

			if (
				propertyName &&
				ALL_RETURNING_NODES.some(
					(allReturningNode) => allReturningNode === propertyName
				)
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
			CallExpression(node: TSESTree.CallExpression) {
				const { callee } = node;
				const property = isMemberExpression(callee) ? callee.property : null;
				const object = isMemberExpression(callee) ? callee.object : null;

				const propertyName = ASTUtils.isIdentifier(property)
					? property.name
					: null;
				const objectName = ASTUtils.isIdentifier(object) ? object.name : null;

				const isEventHandlerMethod = EVENT_HANDLER_METHODS.some(
					(method) => method === propertyName
				);
				const hasUserEventInstanceName = userEventInstanceNames.has(
					objectName ?? ''
				);
				const testingLibraryFn = resolveToTestingLibraryFn(node, context);

				if (
					!testingLibraryFn &&
					isEventHandlerMethod &&
					!hasUserEventInstanceName
				) {
					context.report({
						node,
						loc: property?.loc.start,
						messageId: 'noNodeAccess',
					});
				}
			},
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				const { init, id } = node;

				if (!isCallExpression(init)) {
					return;
				}

				if (
					!isMemberExpression(init.callee) ||
					!ASTUtils.isIdentifier(init.callee.object)
				) {
					return;
				}

				const testingLibraryFn = resolveToTestingLibraryFn(init, context);
				if (
					init.callee.object.name === testingLibraryFn?.local &&
					ASTUtils.isIdentifier(init.callee.property) &&
					init.callee.property.name === 'setup' &&
					ASTUtils.isIdentifier(id)
				) {
					userEventInstanceNames.add(id.name);
				}
			},
			'ExpressionStatement MemberExpression': showErrorForNodeAccess,
			'VariableDeclarator MemberExpression': showErrorForNodeAccess,
		};
	},
});
