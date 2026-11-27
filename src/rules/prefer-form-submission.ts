import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	isCallExpression,
	isMemberExpression,
	isNewExpression,
} from '../node-utils';
import { isStringNode } from '../node-utils/accessors';
import { getScope } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'prefer-form-submission';
const EVENT_CONSTRUCTORS = ['Event', 'SubmitEvent'];

export type MessageIds = 'preferFormSubmission';
export type Options = [];

function isPropertyNamed(
	node: TSESTree.MemberExpression,
	name: string
): boolean {
	return (
		(ASTUtils.isIdentifier(node.property) && node.property.name === name) ||
		(node.computed && isStringNode(node.property, name))
	);
}

function isEventConstructor(node: TSESTree.Node): boolean {
	if (ASTUtils.isIdentifier(node)) {
		return EVENT_CONSTRUCTORS.includes(node.name);
	}

	return (
		isMemberExpression(node) &&
		EVENT_CONSTRUCTORS.some((name) => isPropertyNamed(node, name))
	);
}

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Suggest submitting forms with `requestSubmit` or a submit button',
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
			preferFormSubmission:
				'Use `form.requestSubmit()` or interact with a submit button instead of dispatching a `submit` event directly',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		function isSubmitEvent(
			node: TSESTree.Node | undefined,
			checkedVariables = new Set<string>()
		): boolean {
			if (!node) {
				return false;
			}

			if (isNewExpression(node)) {
				return (
					isEventConstructor(node.callee) &&
					!!node.arguments[0] &&
					isStringNode(node.arguments[0], 'submit')
				);
			}

			if (isCallExpression(node) && helpers.isCreateEventUtil(node)) {
				if (
					isMemberExpression(node.callee) &&
					isPropertyNamed(node.callee, 'submit')
				) {
					return true;
				}

				return !!node.arguments[0] && isStringNode(node.arguments[0], 'submit');
			}

			if (ASTUtils.isIdentifier(node) && !checkedVariables.has(node.name)) {
				const variable = ASTUtils.findVariable(
					getScope(context, node),
					node.name
				);
				if (!variable) {
					return false;
				}

				const nextCheckedVariables = new Set(checkedVariables).add(node.name);
				return variable.defs.some((definition) => {
					return (
						ASTUtils.isVariableDeclarator(definition.node) &&
						!!definition.node.init &&
						isSubmitEvent(definition.node.init, nextCheckedVariables)
					);
				});
			}

			return false;
		}

		function report(node: TSESTree.Node): void {
			context.report({
				node,
				messageId: 'preferFormSubmission',
			});
		}

		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				if (!helpers.isFireEventMethod(node)) {
					return;
				}

				const callExpression = findClosestCallExpressionNode(node, true);
				if (!callExpression) {
					return;
				}

				if (
					node.name === 'submit' ||
					isSubmitEvent(callExpression.arguments[1])
				) {
					report(callExpression.callee);
				}
			},

			CallExpression(node: TSESTree.CallExpression) {
				if (
					isMemberExpression(node.callee) &&
					isPropertyNamed(node.callee, 'dispatchEvent') &&
					isSubmitEvent(node.arguments[0])
				) {
					report(node.callee);
				}
			},
		};
	},
});
