import { ASTUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallExpressionNode,
	findClosestFunctionExpressionNode,
	getFunctionName,
	getInnermostReturningFunction,
	getVariableReferences,
	isMemberExpression,
	isPromiseHandled,
} from '../node-utils';
import { EVENTS_SIMULATORS } from '../utils';

export const RULE_NAME = 'await-async-events';
export type MessageIds = 'awaitAsyncEvent' | 'awaitAsyncEventWrapper';
const FIRE_EVENT_NAME = 'fireEvent';
const USER_EVENT_NAME = 'userEvent';
const USER_EVENT_SETUP_FUNCTION_NAME = 'setup';
type EventModules = (typeof EVENTS_SIMULATORS)[number];
export type Options = [
	{
		eventModule: EventModules | EventModules[];
	},
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
				svelte: ['error', { eventModule: ['fireEvent', 'userEvent'] }],
				marko: ['error', { eventModule: ['fireEvent', 'userEvent'] }],
			},
		},
		messages: {
			awaitAsyncEvent:
				'Promise returned from async event method `{{ name }}` must be handled',
			awaitAsyncEventWrapper:
				'Promise returned from `{{ name }}` wrapper over async event method must be handled',
		},
		fixable: 'code',
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
								enum: EVENTS_SIMULATORS.concat(),
								type: 'string',
							},
							{
								items: {
									type: 'string',
									enum: EVENTS_SIMULATORS.concat(),
								},
								type: 'array',
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

		function reportUnhandledNode({
			node,
			closestCallExpression,
			messageId = 'awaitAsyncEvent',
			fix,
		}: {
			node: TSESTree.Identifier;
			closestCallExpression: TSESTree.CallExpression;
			messageId?: MessageIds;
			fix?: TSESLint.ReportFixFunction;
		}): void {
			if (!isPromiseHandled(node)) {
				context.report({
					node: closestCallExpression.callee,
					messageId,
					data: { name: node.name },
					fix,
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
					if (node.name === USER_EVENT_SETUP_FUNCTION_NAME) {
						return;
					}

					detectEventMethodWrapper(node);

					const closestCallExpression = findClosestCallExpressionNode(
						node,
						true
					);

					if (!closestCallExpression?.parent) {
						return;
					}

					const references = getVariableReferences(
						context,
						closestCallExpression.parent
					);

					if (references.length === 0) {
						reportUnhandledNode({
							node,
							closestCallExpression,
							fix: (fixer) => {
								if (isMemberExpression(node.parent)) {
									const functionExpression =
										findClosestFunctionExpressionNode(node);

									if (functionExpression) {
										const memberExpressionFixer = fixer.insertTextBefore(
											node.parent,
											'await '
										);

										if (functionExpression.async) {
											return memberExpressionFixer;
										} else {
											// Mutate the actual node so if other nodes exist in this
											// function expression body they don't also try to fix it.
											functionExpression.async = true;

											return [
												memberExpressionFixer,
												fixer.insertTextBefore(functionExpression, 'async '),
											];
										}
									}
								}

								return null;
							},
						});
					} else {
						for (const reference of references) {
							if (ASTUtils.isIdentifier(reference.identifier)) {
								reportUnhandledNode({
									node: reference.identifier,
									closestCallExpression,
								});
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

					reportUnhandledNode({
						node,
						closestCallExpression,
						messageId: 'awaitAsyncEventWrapper',
						fix: (fixer) => {
							const functionExpression =
								findClosestFunctionExpressionNode(node);

							if (functionExpression) {
								const nodeFixer = fixer.insertTextBefore(node, 'await ');

								if (functionExpression.async) {
									return nodeFixer;
								} else {
									// Mutate the actual node so if other nodes exist in this
									// function expression body they don't also try to fix it.
									functionExpression.async = true;

									return [
										nodeFixer,
										fixer.insertTextBefore(functionExpression, 'async '),
									];
								}
							}

							return null;
						},
					});
				}
			},
		};
	},
});
