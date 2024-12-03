import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	getFunctionName,
	getInnermostReturningFunction,
	isCallExpression,
} from '../node-utils';
import { TESTING_FRAMEWORK_SETUP_HOOKS } from '../utils';

export const RULE_NAME = 'no-render-in-lifecycle';
export type MessageIds = 'noRenderInSetup';
type Options = [
	{
		allowTestingFrameworkSetupHook?: string;
	},
];

export function findClosestBeforeHook(
	node: TSESTree.Node | null,
	testingFrameworkSetupHooksToFilter: string[]
): TSESTree.Identifier | null {
	if (node === null) {
		return null;
	}

	if (
		isCallExpression(node) &&
		ASTUtils.isIdentifier(node.callee) &&
		testingFrameworkSetupHooksToFilter.includes(node.callee.name)
	) {
		return node.callee;
	}

	if (node.parent) {
		return findClosestBeforeHook(
			node.parent,
			testingFrameworkSetupHooksToFilter
		);
	}

	return null;
}

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow the use of `render` in testing frameworks setup functions',
			recommendedConfig: {
				dom: false,
				angular: 'error',
				react: 'error',
				vue: 'error',
				svelte: 'error',
				marko: 'error',
			},
		},
		messages: {
			noRenderInSetup:
				'Forbidden usage of `render` within testing framework `{{ name }}` setup',
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowTestingFrameworkSetupHook: {
						enum: TESTING_FRAMEWORK_SETUP_HOOKS,
						type: 'string',
					},
				},
			},
		],
	},
	defaultOptions: [
		{
			allowTestingFrameworkSetupHook: '',
		},
	],

	create(context, [{ allowTestingFrameworkSetupHook }], helpers) {
		const renderWrapperNames: string[] = [];

		function detectRenderWrapper(node: TSESTree.Identifier): void {
			const innerFunction = getInnermostReturningFunction(context, node);

			if (innerFunction) {
				renderWrapperNames.push(getFunctionName(innerFunction));
			}
		}

		return {
			CallExpression(node) {
				const testingFrameworkSetupHooksToFilter =
					TESTING_FRAMEWORK_SETUP_HOOKS.filter(
						(hook) => hook !== allowTestingFrameworkSetupHook
					);
				const callExpressionIdentifier = getDeepestIdentifierNode(node);

				if (!callExpressionIdentifier) {
					return;
				}

				const isRenderIdentifier = helpers.isRenderUtil(
					callExpressionIdentifier
				);

				if (isRenderIdentifier) {
					detectRenderWrapper(callExpressionIdentifier);
				}

				if (
					!isRenderIdentifier &&
					!renderWrapperNames.includes(callExpressionIdentifier.name)
				) {
					return;
				}

				const beforeHook = findClosestBeforeHook(
					node,
					testingFrameworkSetupHooksToFilter
				);

				if (!beforeHook) {
					return;
				}

				context.report({
					node: callExpressionIdentifier,
					messageId: 'noRenderInSetup',
					data: {
						name: beforeHook.name,
					},
				});
			},
		};
	},
});
