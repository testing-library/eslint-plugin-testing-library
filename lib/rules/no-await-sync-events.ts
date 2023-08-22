import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	getPropertyIdentifierNode,
	isLiteral,
	isObjectExpression,
	isProperty,
} from '../node-utils';

const USER_EVENT_ASYNC_EXCEPTIONS: string[] = ['type', 'keyboard'];
const FIRE_EVENT_OPTION = 'fire-event' as const;
const USER_EVENT_OPTION = 'user-event' as const;
const VALID_EVENT_MODULES = [FIRE_EVENT_OPTION, USER_EVENT_OPTION];

export const RULE_NAME = 'no-await-sync-events';
export type MessageIds = 'noAwaitSyncEvents';

type ValidEventModules = (typeof VALID_EVENT_MODULES)[number];
type EventModulesOptions = ReadonlyArray<ValidEventModules> | ValidEventModules;
type Options = [{ eventModules?: EventModulesOptions }];

function getEnabledEventModules(
	eventModulesOption?: EventModulesOptions | undefined
): ReadonlyArray<ValidEventModules> {
	if (typeof eventModulesOption === 'undefined') {
		// This should match the default option
		return [FIRE_EVENT_OPTION];
	} else if (typeof eventModulesOption === 'string') {
		return [eventModulesOption];
	}
	return eventModulesOption;
}

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow unnecessary `await` for sync events',
			recommendedConfig: {
				dom: ['error', { eventModules: 'fire-event' }],
				angular: ['error', { eventModules: 'fire-event' }],
				react: ['error', { eventModules: 'fire-event' }],
				vue: false,
				marko: false,
			},
		},
		messages: {
			noAwaitSyncEvents:
				'`{{ name }}` is sync and does not need `await` operator',
		},
		schema: [
			{
				type: 'object',
				properties: {
					eventModules: {
						default: FIRE_EVENT_OPTION,
						oneOf: [
							{ type: 'string', enum: VALID_EVENT_MODULES },
							{
								type: 'array',
								itmes: { type: 'string', enum: VALID_EVENT_MODULES },
								minItems: 1,
							},
						],
					},
				},
				additionalProperties: false,
			},
		],
	},
	defaultOptions: [{ eventModules: FIRE_EVENT_OPTION }],

	create(context, [options], helpers) {
		const { eventModules = VALID_EVENT_MODULES } = options;
		let hasDelayDeclarationOrAssignmentGTZero: boolean;

		// userEvent.type() and userEvent.keyboard() are exceptions, which returns a
		// Promise. But it is only necessary to wait when delay option other than 0
		// is specified. So this rule has a special exception for the case await:
		//  - userEvent.type(element, 'abc', {delay: 1234})
		//  - userEvent.keyboard('abc', {delay: 1234})
		return {
			VariableDeclaration(node: TSESTree.VariableDeclaration) {
				// Case delay has been declared outside of call expression's arguments
				// Let's save the info if it is greater than zero
				hasDelayDeclarationOrAssignmentGTZero = node.declarations.some(
					(property) =>
						ASTUtils.isIdentifier(property.id) &&
						property.id.name === 'delay' &&
						isLiteral(property.init) &&
						property.init.value &&
						property.init.value > 0
				);
			},
			AssignmentExpression(node: TSESTree.AssignmentExpression) {
				// Case delay has been assigned or re-assigned outside of call expression's arguments
				// Let's save the info if it is greater than zero
				if (
					ASTUtils.isIdentifier(node.left) &&
					node.left.name === 'delay' &&
					isLiteral(node.right) &&
					node.right.value !== null
				) {
					hasDelayDeclarationOrAssignmentGTZero = node.right.value > 0;
				}
			},
			'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
				const simulateEventFunctionIdentifier = getDeepestIdentifierNode(node);
				const enabledEventModules = getEnabledEventModules(eventModules);
				const isFireEventEnabled =
					enabledEventModules.includes(FIRE_EVENT_OPTION);
				const isUserEventEnabled =
					enabledEventModules.includes(USER_EVENT_OPTION);

				if (!simulateEventFunctionIdentifier) {
					return;
				}

				const isUserEventMethod = helpers.isUserEventMethod(
					simulateEventFunctionIdentifier
				);
				const isFireEventMethod = helpers.isFireEventMethod(
					simulateEventFunctionIdentifier
				);
				const isSimulateEventMethod = isUserEventMethod || isFireEventMethod;

				if (!isSimulateEventMethod) {
					return;
				}

				if (isFireEventMethod && !isFireEventEnabled) {
					return;
				}
				if (isUserEventMethod && !isUserEventEnabled) {
					return;
				}

				const lastArg = node.arguments[node.arguments.length - 1];

				// Checking if there's a delay property
				// Note: delay's value may have declared or assigned somewhere else (as a variable declaration or as an assignment expression)
				// or right after this (as a literal)
				const hasDelayProperty =
					isObjectExpression(lastArg) &&
					lastArg.properties.some(
						(property) =>
							isProperty(property) &&
							ASTUtils.isIdentifier(property.key) &&
							property.key.name === 'delay'
					);

				// In case delay's value has been declared as a literal
				const hasDelayLiteralGTZero =
					isObjectExpression(lastArg) &&
					lastArg.properties.some(
						(property) =>
							isProperty(property) &&
							ASTUtils.isIdentifier(property.key) &&
							property.key.name === 'delay' &&
							isLiteral(property.value) &&
							!!property.value.value &&
							property.value.value > 0
					);

				const simulateEventFunctionName = simulateEventFunctionIdentifier.name;

				if (
					USER_EVENT_ASYNC_EXCEPTIONS.includes(simulateEventFunctionName) &&
					hasDelayProperty &&
					(hasDelayDeclarationOrAssignmentGTZero || hasDelayLiteralGTZero)
				) {
					return;
				}

				const eventModuleName = getPropertyIdentifierNode(node)?.name;
				const eventFullName = eventModuleName
					? `${eventModuleName}.${simulateEventFunctionName}`
					: simulateEventFunctionName;

				context.report({
					node,
					messageId: 'noAwaitSyncEvents',
					data: {
						name: eventFullName,
					},
				});
			},
		};
	},
});
