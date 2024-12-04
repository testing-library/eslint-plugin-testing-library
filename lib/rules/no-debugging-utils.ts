import { ASTUtils, TSESTree, JSONSchema } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	getFunctionName,
	getInnermostReturningFunction,
	getPropertyIdentifierNode,
	getReferenceNode,
	isCallExpression,
	isObjectPattern,
	isProperty,
} from '../node-utils';
import { DEBUG_UTILS, getDeclaredVariables } from '../utils';

type DebugUtilsToCheckForConfig = Record<(typeof DEBUG_UTILS)[number], boolean>;
type DebugUtilsToCheckFor = Partial<DebugUtilsToCheckForConfig>;

export const RULE_NAME = 'no-debugging-utils';
export type MessageIds = 'noDebug';
type Options = [{ utilsToCheckFor?: DebugUtilsToCheckFor }];

const defaultUtilsToCheckFor: DebugUtilsToCheckForConfig = {
	debug: true,
	logTestingPlaygroundURL: true,
	prettyDOM: true,
	logRoles: true,
	logDOM: true,
	prettyFormat: true,
};

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow the use of debugging utilities like `debug`',
			recommendedConfig: {
				dom: false,
				angular: 'warn',
				react: 'warn',
				vue: 'warn',
				svelte: 'warn',
				marko: 'warn',
			},
		},
		messages: {
			noDebug: 'Unexpected debug statement',
		},
		schema: [
			{
				type: 'object',
				properties: {
					utilsToCheckFor: {
						type: 'object',
						properties: DEBUG_UTILS.reduce<
							Record<string, JSONSchema.JSONSchema4>
						>(
							(obj, name) => ({
								[name]: { type: 'boolean' },
								...obj,
							}),
							{}
						),
						additionalProperties: false,
					},
				},
				additionalProperties: false,
			},
		],
	},
	defaultOptions: [{ utilsToCheckFor: defaultUtilsToCheckFor }],

	create(context, [{ utilsToCheckFor = {} }], helpers) {
		const suspiciousDebugVariableNames: string[] = [];
		const suspiciousReferenceNodes: TSESTree.Identifier[] = [];
		const renderWrapperNames: string[] = [];
		const builtInConsoleNodes: TSESTree.VariableDeclarator[] = [];

		const utilsToReport = Object.entries(utilsToCheckFor)
			.filter(([, shouldCheckFor]) => shouldCheckFor)
			.map(([name]) => name);

		function detectRenderWrapper(node: TSESTree.Identifier): void {
			const innerFunction = getInnermostReturningFunction(context, node);

			if (innerFunction) {
				renderWrapperNames.push(getFunctionName(innerFunction));
			}
		}

		return {
			VariableDeclarator(node) {
				if (!node.init) {
					return;
				}
				const initIdentifierNode = getDeepestIdentifierNode(node.init);

				if (!initIdentifierNode) {
					return;
				}

				if (initIdentifierNode.name === 'console') {
					builtInConsoleNodes.push(node);
					return;
				}

				const isRenderWrapperVariableDeclarator = renderWrapperNames.includes(
					initIdentifierNode.name
				);

				if (
					!helpers.isRenderVariableDeclarator(node) &&
					!isRenderWrapperVariableDeclarator
				) {
					return;
				}

				// find debug obtained from render and save their name, like:
				// const { debug } = render();
				if (isObjectPattern(node.id)) {
					for (const property of node.id.properties) {
						if (
							isProperty(property) &&
							ASTUtils.isIdentifier(property.key) &&
							utilsToReport.includes(property.key.name)
						) {
							const identifierNode = getDeepestIdentifierNode(property.value);

							if (identifierNode) {
								suspiciousDebugVariableNames.push(identifierNode.name);
							}
						}
					}
				}

				// find utils kept from render and save their node, like:
				// const utils = render();
				if (ASTUtils.isIdentifier(node.id)) {
					suspiciousReferenceNodes.push(node.id);
				}
			},
			CallExpression(node) {
				const callExpressionIdentifier = getDeepestIdentifierNode(node);

				if (!callExpressionIdentifier) {
					return;
				}

				if (helpers.isRenderUtil(callExpressionIdentifier)) {
					detectRenderWrapper(callExpressionIdentifier);
				}

				const referenceNode = getReferenceNode(node);
				const referenceIdentifier = getPropertyIdentifierNode(referenceNode);

				if (!referenceIdentifier) {
					return;
				}

				const isDebugUtil = helpers.isDebugUtil(
					callExpressionIdentifier,
					utilsToReport as Array<(typeof DEBUG_UTILS)[number]>
				);
				const isDeclaredDebugVariable = suspiciousDebugVariableNames.includes(
					callExpressionIdentifier.name
				);
				const isChainedReferenceDebug = suspiciousReferenceNodes.some(
					(suspiciousReferenceIdentifier) => {
						return (
							utilsToReport.includes(callExpressionIdentifier.name) &&
							suspiciousReferenceIdentifier.name === referenceIdentifier.name
						);
					}
				);

				const isVariableFromBuiltInConsole = builtInConsoleNodes.some(
					(variableDeclarator) => {
						const variables = getDeclaredVariables(context, variableDeclarator);
						return variables.some(
							({ name }) =>
								name === callExpressionIdentifier.name &&
								isCallExpression(callExpressionIdentifier.parent)
						);
					}
				);

				if (
					!isVariableFromBuiltInConsole &&
					(isDebugUtil || isDeclaredDebugVariable || isChainedReferenceDebug)
				) {
					context.report({
						node: callExpressionIdentifier,
						messageId: 'noDebug',
					});
				}
			},
		};
	},
});
