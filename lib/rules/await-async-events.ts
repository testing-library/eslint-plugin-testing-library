import {
	AST_NODE_TYPES,
	ASTUtils,
	TSESLint,
	TSESTree,
} from '@typescript-eslint/utils';

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

		// Track variables assigned from userEvent.setup() (directly or via destructuring)
		const userEventSetupVars = new Set<string>();

		// Temporary: Map function names to property names that are assigned from userEvent.setup()
		const tempSetupFunctionProps = new Map<string, Set<string>>();

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
			// Track variables assigned from userEvent.setup() and destructuring from setup functions
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				// Direct assignment: const user = userEvent.setup();
				if (
					isUserEventEnabled &&
					node.init &&
					node.init.type === AST_NODE_TYPES.CallExpression &&
					node.init.callee.type === AST_NODE_TYPES.MemberExpression &&
					node.init.callee.object.type === AST_NODE_TYPES.Identifier &&
					node.init.callee.object.name === USER_EVENT_NAME &&
					node.init.callee.property.type === AST_NODE_TYPES.Identifier &&
					node.init.callee.property.name === USER_EVENT_SETUP_FUNCTION_NAME &&
					node.id.type === AST_NODE_TYPES.Identifier
				) {
					userEventSetupVars.add(node.id.name);
				}

				// Destructuring: const { user, myUser: alias } = setup(...)
				if (
					isUserEventEnabled &&
					node.id.type === AST_NODE_TYPES.ObjectPattern &&
					node.init &&
					node.init.type === AST_NODE_TYPES.CallExpression &&
					node.init.callee.type === AST_NODE_TYPES.Identifier &&
					tempSetupFunctionProps.has(node.init.callee.name)
				) {
					const setupProps = tempSetupFunctionProps.get(node.init.callee.name)!;
					for (const prop of node.id.properties) {
						if (
							prop.type === AST_NODE_TYPES.Property &&
							prop.key.type === AST_NODE_TYPES.Identifier &&
							setupProps.has(prop.key.name) &&
							prop.value.type === AST_NODE_TYPES.Identifier
						) {
							userEventSetupVars.add(prop.value.name);
						}
					}
				}
			},

			// Track functions that return { ...: userEvent.setup(), ... }
			ReturnStatement(node: TSESTree.ReturnStatement) {
				if (
					isUserEventEnabled &&
					node.argument &&
					node.argument.type === AST_NODE_TYPES.ObjectExpression
				) {
					const setupProps = new Set<string>();
					for (const prop of node.argument.properties) {
						if (
							prop.type === AST_NODE_TYPES.Property &&
							prop.key.type === AST_NODE_TYPES.Identifier
						) {
							// Direct: foo: userEvent.setup()
							if (
								prop.value.type === AST_NODE_TYPES.CallExpression &&
								prop.value.callee.type === AST_NODE_TYPES.MemberExpression &&
								prop.value.callee.object.type === AST_NODE_TYPES.Identifier &&
								prop.value.callee.object.name === USER_EVENT_NAME &&
								prop.value.callee.property.type === AST_NODE_TYPES.Identifier &&
								prop.value.callee.property.name ===
									USER_EVENT_SETUP_FUNCTION_NAME
							) {
								setupProps.add(prop.key.name);
							}
							// Indirect: foo: u, where u is a userEvent.setup() var
							else if (
								prop.value.type === AST_NODE_TYPES.Identifier &&
								userEventSetupVars.has(prop.value.name)
							) {
								setupProps.add(prop.key.name);
							}
						}
					}
					if (setupProps.size > 0) {
						// Find the function this return is in
						let parent: TSESTree.Node | undefined = node.parent;
						while (parent) {
							if (
								parent.type === AST_NODE_TYPES.FunctionDeclaration ||
								parent.type === AST_NODE_TYPES.FunctionExpression ||
								parent.type === AST_NODE_TYPES.ArrowFunctionExpression
							) {
								const name = getFunctionName(parent);
								if (name) {
									tempSetupFunctionProps.set(name, setupProps);
								}
								break;
							}
							parent = parent.parent;
						}
					}
				}
			},

			'CallExpression Identifier'(node: TSESTree.Identifier) {
				if (
					(isFireEventEnabled && helpers.isFireEventMethod(node)) ||
					(isUserEventEnabled &&
						helpers.isUserEventMethod(node, userEventSetupVars))
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
