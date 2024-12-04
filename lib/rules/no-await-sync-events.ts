import { ASTUtils, TSESTree } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	getPropertyIdentifierNode,
	isLiteral,
	isObjectExpression,
	isProperty,
} from '../node-utils';

const USER_EVENT_ASYNC_EXCEPTIONS = ['type', 'keyboard'];
const FIRE_EVENT_OPTION = 'fire-event';
const USER_EVENT_OPTION = 'user-event';
const VALID_EVENT_MODULES = [FIRE_EVENT_OPTION, USER_EVENT_OPTION];
const DEFAULT_EVENT_MODULES = [FIRE_EVENT_OPTION];

export const RULE_NAME = 'no-await-sync-events';
export type MessageIds = 'noAwaitSyncEvents';

type ValidEventModules = (typeof VALID_EVENT_MODULES)[number];
type EventModulesOptions = ReadonlyArray<ValidEventModules>;
type Options = [{ eventModules?: EventModulesOptions }];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow unnecessary `await` for sync events',
			recommendedConfig: {
				dom: ['error', { eventModules: DEFAULT_EVENT_MODULES }],
				angular: ['error', { eventModules: DEFAULT_EVENT_MODULES }],
				react: ['error', { eventModules: DEFAULT_EVENT_MODULES }],
				vue: false,
				svelte: false,
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
						type: 'array',
						items: { type: 'string', enum: VALID_EVENT_MODULES },
						minItems: 1,
						default: DEFAULT_EVENT_MODULES,
					},
				},
				additionalProperties: false,
			},
		],
	},
	defaultOptions: [{ eventModules: DEFAULT_EVENT_MODULES }],

	create(context, [options], helpers) {
		const { eventModules = DEFAULT_EVENT_MODULES } = options;
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
						Number.isInteger(property.init.value) &&
						Number(property.init.value) > 0
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
					hasDelayDeclarationOrAssignmentGTZero =
						Number.isInteger(node.right.value) && Number(node.right.value) > 0;
				}
			},
			'AwaitExpression > CallExpression'(node: TSESTree.CallExpression) {
				const simulateEventFunctionIdentifier = getDeepestIdentifierNode(node);

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

				if (isFireEventMethod && !eventModules.includes(FIRE_EVENT_OPTION)) {
					return;
				}
				if (isUserEventMethod && !eventModules.includes(USER_EVENT_OPTION)) {
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
							Number.isInteger(property.value.value) &&
							Number(property.value.value) > 0
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
