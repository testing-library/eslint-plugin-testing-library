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
const VALID_EVENT_MODULES = ['fire-event', 'user-event'] as const;

export const RULE_NAME = 'no-await-sync-events';
export type MessageIds = 'noAwaitSyncEvents';
type Options = [
	{ eventModules?: readonly (typeof VALID_EVENT_MODULES)[number][] }
];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow unnecessary `await` for sync events',
			recommendedConfig: {
				dom: 'error',
				angular: 'error',
				react: 'error',
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
						type: 'array',
						minItems: 1,
						items: {
							enum: VALID_EVENT_MODULES,
						},
					},
				},
				additionalProperties: false,
			},
		],
	},
	defaultOptions: [{ eventModules: VALID_EVENT_MODULES }],

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

				if (isFireEventMethod && !eventModules.includes('fire-event')) {
					return;
				}
				if (isUserEventMethod && !eventModules.includes('user-event')) {
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
