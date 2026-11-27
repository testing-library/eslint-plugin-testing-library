import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	getPropertyIdentifierNode,
	isLiteral,
	isObjectExpression,
	isProperty,
} from '../node-utils';
import { getScope } from '../utils';

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

const DELAY_PROPERTY_NAME = 'delay';
const USER_EVENT_ASYNC_EXCEPTIONS = ['type', 'keyboard'];
const FIRE_EVENT_OPTION = 'fire-event';
const USER_EVENT_OPTION = 'user-event';
const VALID_EVENT_MODULES = [FIRE_EVENT_OPTION, USER_EVENT_OPTION];
const DEFAULT_EVENT_MODULES = [FIRE_EVENT_OPTION];

const RULE_NAME = 'no-await-sync-events';
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

		// Tracks, per resolved variable (not by name), whether the last known
		// value assigned to it was a positive integer literal. Using the
		// scope-resolved `Variable` as key (instead of matching the identifier
		// name `delay` across the whole file) prevents unrelated variables that
		// happen to also be called `delay` in a different scope from leaking
		// into this decision.
		const positiveDelayVariables = new WeakSet<TSESLint.Scope.Variable>();

		function isPositiveIntegerLiteral(
			node: TSESTree.Node | null | undefined
		): boolean {
			return (
				isLiteral(node) &&
				node.value !== null &&
				Number.isInteger(node.value) &&
				Number(node.value) > 0
			);
		}

		function resolveVariable(
			identifier: TSESTree.Identifier
		): TSESLint.Scope.Variable | null {
			return ASTUtils.findVariable(
				getScope(context, identifier),
				identifier.name
			);
		}

		function isKnownPositiveDelayVariable(
			node: TSESTree.Node | null | undefined
		): boolean {
			if (!ASTUtils.isIdentifier(node)) {
				return false;
			}

			const variable = resolveVariable(node);
			return variable !== null && positiveDelayVariables.has(variable);
		}

		function trackDelayAssignment(
			leftIdentifier: TSESTree.Identifier,
			rightValue: TSESTree.Expression | null
		): void {
			if (leftIdentifier.name !== DELAY_PROPERTY_NAME) {
				return;
			}

			const variable = resolveVariable(leftIdentifier);

			if (!variable) {
				return;
			}

			if (isPositiveIntegerLiteral(rightValue)) {
				positiveDelayVariables.add(variable);
			} else {
				positiveDelayVariables.delete(variable);
			}
		}

		// userEvent.type() and userEvent.keyboard() are exceptions, which returns a
		// Promise. But it is only necessary to wait when delay option other than 0
		// is specified. So this rule has a special exception for the case await:
		//  - userEvent.type(element, 'abc', {delay: 1234})
		//  - userEvent.keyboard('abc', {delay: 1234})
		return {
			VariableDeclaration(node: TSESTree.VariableDeclaration) {
				// Case delay has been declared outside of call expression's arguments
				// Let's save the info if it is greater than zero
				for (const declarator of node.declarations) {
					if (ASTUtils.isIdentifier(declarator.id)) {
						trackDelayAssignment(declarator.id, declarator.init);
					}
				}
			},
			AssignmentExpression(node: TSESTree.AssignmentExpression) {
				// Case delay has been assigned or re-assigned outside of call expression's arguments
				// Let's save the info if it is greater than zero
				if (ASTUtils.isIdentifier(node.left)) {
					trackDelayAssignment(node.left, node.right);
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
				const delayProperty = isObjectExpression(lastArg)
					? lastArg.properties.find(
							(property) =>
								isProperty(property) &&
								ASTUtils.isIdentifier(property.key) &&
								property.key.name === DELAY_PROPERTY_NAME
						)
					: undefined;
				const hasDelayProperty = delayProperty !== undefined;

				// In case delay's value has been declared as a literal
				const hasDelayLiteralGTZero =
					isProperty(delayProperty) &&
					isPositiveIntegerLiteral(delayProperty.value);

				// In case delay's value is a reference to a variable resolved to a
				// positive integer literal (declared or (re-)assigned elsewhere)
				const hasDelayVariableGTZero =
					isProperty(delayProperty) &&
					isKnownPositiveDelayVariable(delayProperty.value);

				const simulateEventFunctionName = simulateEventFunctionIdentifier.name;

				if (
					USER_EVENT_ASYNC_EXCEPTIONS.includes(simulateEventFunctionName) &&
					hasDelayProperty &&
					(hasDelayVariableGTZero || hasDelayLiteralGTZero)
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
