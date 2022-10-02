import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	getFunctionName,
	getInnermostReturningFunction,
	getVariableReferences,
	isPromiseHandled,
} from '../node-utils';
import { EVENTS_SIMULATORS } from '../utils';

export const RULE_NAME = 'await-async-event';
export type MessageIds = 'awaitAsyncEvent' | 'awaitAsyncEventWrapper';
const FIRE_EVENT_NAME = 'fireEvent';
const USER_EVENT_NAME = 'userEvent';
type EventModules = typeof EVENTS_SIMULATORS[number];
export type Options = [
	{
		eventModule: EventModules | EventModules[];
	}
];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce promises from async event methods are handled',
			recommendedConfig: {
				dom: ['error', { eventModule: 'userEvent' }],
				angular: ['error', { eventModule: 'userEvent' }],
				react: ['error', { eventModule: 'userEvent' }],
				vue: ['error', { eventModule: ['fireEvent', 'userEvent'] }],
				marko: ['error', { eventModule: ['fireEvent', 'userEvent'] }],
			},
		},
		messages: {
			awaitAsyncEvent:
				'Promise returned from async event method `{{ name }}` must be handled',
			awaitAsyncEventWrapper:
				'Promise returned from `{{ name }}` wrapper over async event method must be handled',
		},
		schema: [
			{
				type: 'object',
				default: {},
				additionalProperties: false,
				properties: {
					eventModule: {
						default: USER_EVENT_NAME,
						oneOf: [
							{
								type: 'string',
								enum: EVENTS_SIMULATORS,
							},
							{
								type: 'array',
								items: {
									type: 'string',
									enum: EVENTS_SIMULATORS,
								},
							},
						],
					},
				},
			},
		],
	},
	defaultOptions: [
		{
			eventModule: USER_EVENT_NAME,
		},
	],

	create(context, [options], helpers) {
		const functionWrappersNames: string[] = [];

		function reportUnhandledNode(
			node: TSESTree.Identifier,
			closestCallExpressionNode: TSESTree.CallExpression,
			messageId: MessageIds = 'awaitAsyncEvent'
		): void {
			if (!isPromiseHandled(node)) {
				context.report({
					node: closestCallExpressionNode.callee,
					messageId,
					data: { name: node.name },
				});
			}
		}

		function detectEventMethodWrapper(node: TSESTree.Identifier): void {
			const innerFunction = getInnermostReturningFunction(context, node);

			if (innerFunction) {
				functionWrappersNames.push(getFunctionName(innerFunction));
			}
		}

		const eventModules =
			typeof options.eventModule === 'string'
				? [options.eventModule]
				: options.eventModule;
		const isFireEventEnabled = eventModules.includes(FIRE_EVENT_NAME);
		const isUserEventEnabled = eventModules.includes(USER_EVENT_NAME);

		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				if (
					(isFireEventEnabled && helpers.isFireEventMethod(node)) ||
					(isUserEventEnabled && helpers.isUserEventMethod(node))
				) {
					detectEventMethodWrapper(node);

					const closestCallExpression = findClosestCallExpressionNode(
						node,
						true
					);

					if (!closestCallExpression || !closestCallExpression.parent) {
						return;
					}

					const references = getVariableReferences(
						context,
						closestCallExpression.parent
					);

					if (references.length === 0) {
						reportUnhandledNode(node, closestCallExpression);
					} else {
						for (const reference of references) {
							if (ASTUtils.isIdentifier(reference.identifier)) {
								reportUnhandledNode(
									reference.identifier,
									closestCallExpression
								);
							}
						}
					}
				} else if (functionWrappersNames.includes(node.name)) {
					// report promise returned from function wrapping fire event method
					// previously detected
					const closestCallExpression = findClosestCallExpressionNode(
						node,
						true
					);

					if (!closestCallExpression) {
						return;
					}

					reportUnhandledNode(
						node,
						closestCallExpression,
						'awaitAsyncEventWrapper'
					);
				}
			},
		};
	},
});
