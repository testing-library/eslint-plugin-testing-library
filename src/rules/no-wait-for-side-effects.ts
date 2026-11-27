import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import { isAwaitExpression } from '@typescript-eslint/utils/ast-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getPropertyIdentifierNode,
	isExpressionStatement,
	isVariableDeclaration,
	isAssignmentExpression,
	isCallExpression,
	isMemberExpression,
	isSequenceExpression,
	hasThenProperty,
} from '../node-utils';
import { getSourceCode } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'no-wait-for-side-effects';
export type MessageIds = 'noSideEffectsWaitFor';
type Options = [];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow the use of side effects in `waitFor`',
			recommendedConfig: {
				dom: 'error',
				angular: 'error',
				react: 'error',
				vue: 'error',
				svelte: 'error',
				marko: 'error',
			},
		},
		messages: {
			noSideEffectsWaitFor:
				'Avoid using side effects within `waitFor` callback',
		},
		schema: [],
		fixable: 'code',
	},
	defaultOptions: [],
	create(context, _, helpers) {
		const sourceCode = getSourceCode(context);

		// Variables holding a `userEvent.setup()` instance, e.g. `const user = userEvent.setup()`
		const userEventSetupVars = new Set<string>();

		function isSideEffectUtil(identifier: TSESTree.Identifier): boolean {
			return (
				helpers.isFireEventUtil(identifier) ||
				helpers.isUserEventUtil(identifier) ||
				userEventSetupVars.has(identifier.name) ||
				helpers.isRenderUtil(identifier)
			);
		}

		function trackUserEventSetupVar(node: TSESTree.VariableDeclarator) {
			if (
				ASTUtils.isIdentifier(node.id) &&
				isCallExpression(node.init) &&
				isMemberExpression(node.init.callee) &&
				ASTUtils.isIdentifier(node.init.callee.object) &&
				ASTUtils.isIdentifier(node.init.callee.property) &&
				node.init.callee.property.name === 'setup' &&
				helpers.isUserEventUtil(node.init.callee.object)
			) {
				userEventSetupVars.add(node.id.name);
			}
		}

		function isCallerWaitFor(
			node:
				| TSESTree.AssignmentExpression
				| TSESTree.BlockStatement
				| TSESTree.CallExpression
				| TSESTree.SequenceExpression
		): boolean {
			if (!node.parent) {
				return false;
			}
			const callExpressionNode = node.parent.parent as TSESTree.CallExpression;
			const callExpressionIdentifier =
				getPropertyIdentifierNode(callExpressionNode);

			return (
				!!callExpressionIdentifier &&
				helpers.isAsyncUtil(callExpressionIdentifier, ['waitFor'])
			);
		}

		function isCallerThen(
			node:
				| TSESTree.AssignmentExpression
				| TSESTree.BlockStatement
				| TSESTree.CallExpression
				| TSESTree.SequenceExpression
		): boolean {
			if (!node.parent) {
				return false;
			}

			const callExpressionNode = node.parent.parent as TSESTree.CallExpression;

			return hasThenProperty(callExpressionNode.callee);
		}

		function isRenderInVariableDeclaration(node: TSESTree.Node) {
			return (
				isVariableDeclaration(node) &&
				node.declarations.some(helpers.isRenderVariableDeclarator)
			);
		}

		function isRenderInExpressionStatement(node: TSESTree.Node) {
			if (
				!isExpressionStatement(node) ||
				!isAssignmentExpression(node.expression)
			) {
				return false;
			}

			const expressionIdentifier = getPropertyIdentifierNode(
				node.expression.right
			);

			if (!expressionIdentifier) {
				return false;
			}

			return helpers.isRenderUtil(expressionIdentifier);
		}

		function isRenderInAssignmentExpression(node: TSESTree.Node) {
			if (!isAssignmentExpression(node)) {
				return false;
			}

			const expressionIdentifier = getPropertyIdentifierNode(node.right);
			if (!expressionIdentifier) {
				return false;
			}

			return helpers.isRenderUtil(expressionIdentifier);
		}

		function isRenderInSequenceAssignment(node: TSESTree.Node) {
			if (!isSequenceExpression(node)) {
				return false;
			}

			return node.expressions.some(isRenderInAssignmentExpression);
		}

		/**
		 * Checks if there are side effects in variable declarations.
		 *
		 * For example, these variable declarations have side effects:
		 * const a = userEvent.doubleClick(button);
		 * const b = fireEvent.click(button);
		 * const wrapper = render(<Component />);
		 *
		 * @param node
		 * @returns {Boolean} Boolean indicating if variable declarataion has side effects
		 */
		function isSideEffectInVariableDeclaration(
			node: TSESTree.VariableDeclaration
		): boolean {
			return node.declarations.some((declaration) => {
				if (isCallExpression(declaration.init)) {
					const test = getPropertyIdentifierNode(declaration.init);

					if (!test) {
						return false;
					}

					return isSideEffectUtil(test);
				}
				return false;
			});
		}

		function getSideEffectNodes(
			body: TSESTree.Node[]
		): TSESTree.ExpressionStatement[] {
			return body.filter((node) => {
				if (!isExpressionStatement(node) && !isVariableDeclaration(node)) {
					return false;
				}

				if (
					isRenderInVariableDeclaration(node) ||
					isRenderInExpressionStatement(node)
				) {
					return true;
				}

				if (
					isVariableDeclaration(node) &&
					isSideEffectInVariableDeclaration(node)
				) {
					return true;
				}

				// unwrap `void userEvent.click(el)`
				const expressionIdentifier = getPropertyIdentifierNode(
					isExpressionStatement(node) &&
						node.expression.type === AST_NODE_TYPES.UnaryExpression &&
						node.expression.operator === 'void'
						? node.expression.argument
						: node
				);

				if (!expressionIdentifier) {
					return false;
				}

				return isSideEffectUtil(expressionIdentifier);
			}) as TSESTree.ExpressionStatement[];
		}

		function reportSideEffects(
			node: TSESTree.BlockStatement & {
				parent: (
					| TSESTree.ArrowFunctionExpression
					| TSESTree.FunctionDeclaration
					| TSESTree.FunctionExpression
				) & {
					parent: TSESTree.CallExpression;
				};
			}
		) {
			if (!isCallerWaitFor(node)) {
				return;
			}

			if (isCallerThen(node)) {
				return;
			}

			const sideEffects = getSideEffectNodes(node.body);
			sideEffects.forEach((sideEffectNode) =>
				context.report({
					node: sideEffectNode,
					messageId: 'noSideEffectsWaitFor',
					fix(fixer) {
						const { parent: callExpressionNode } = node.parent;
						const targetNode = isAwaitExpression(callExpressionNode.parent)
							? callExpressionNode.parent
							: callExpressionNode;

						const lines = sourceCode.getText().split('\n');
						const line = lines[targetNode.loc.start.line - 1];
						const indent = line?.match(/^\s*/)?.[0] ?? '';
						const sideEffectLines = lines.slice(
							sideEffectNode.loc.start.line - 1,
							sideEffectNode.loc.end.line
						);
						const sideEffectNodeText = sideEffectLines.join('\n').trimStart();
						if (
							sideEffects.length === node.body.length &&
							sideEffects.length === 1
						) {
							const tokenAfter = sourceCode.getTokenAfter(targetNode);
							return [
								fixer.insertTextBefore(targetNode, sideEffectNodeText),
								tokenAfter?.value === ';'
									? fixer.removeRange([
											targetNode.range[0],
											tokenAfter.range[1],
										])
									: fixer.remove(targetNode),
							];
						}

						const lineStart = sourceCode.getIndexFromLoc({
							line: sideEffectNode.loc.start.line,
							column: 0,
						});
						const lineEnd = sourceCode.getIndexFromLoc({
							line: sideEffectNode.loc.end.line + 1,
							column: 0,
						});

						return [
							fixer.insertTextBefore(
								targetNode,
								sideEffectNodeText + '\n' + indent
							),
							fixer.removeRange([lineStart, lineEnd]),
						];
					},
				})
			);
		}

		function reportImplicitReturnSideEffect(
			node: (
				| TSESTree.AssignmentExpression
				| TSESTree.CallExpression
				| TSESTree.SequenceExpression
			) & {
				parent: (
					| TSESTree.ArrowFunctionExpression
					| TSESTree.FunctionDeclaration
					| TSESTree.FunctionExpression
				) & {
					parent: TSESTree.CallExpression;
				};
			}
		) {
			if (!isCallerWaitFor(node)) {
				return;
			}

			const expressionIdentifier = isCallExpression(node)
				? getPropertyIdentifierNode(node.callee)
				: null;

			if (
				!expressionIdentifier &&
				!isRenderInAssignmentExpression(node) &&
				!isRenderInSequenceAssignment(node)
			) {
				return;
			}

			if (expressionIdentifier && !isSideEffectUtil(expressionIdentifier)) {
				return;
			}

			context.report({
				node,
				messageId: 'noSideEffectsWaitFor',
				fix: (fixer) => {
					const { parent: callExpressionNode } = node.parent;
					const targetNode = isAwaitExpression(callExpressionNode.parent)
						? callExpressionNode.parent
						: callExpressionNode;

					return fixer.replaceText(targetNode, sourceCode.getText(node));
				},
			});
		}

		return {
			VariableDeclarator: trackUserEventSetupVar,
			'CallExpression > ArrowFunctionExpression > BlockStatement':
				reportSideEffects,
			'CallExpression > ArrowFunctionExpression > CallExpression':
				reportImplicitReturnSideEffect,
			'CallExpression > ArrowFunctionExpression > AssignmentExpression':
				reportImplicitReturnSideEffect,
			'CallExpression > ArrowFunctionExpression > SequenceExpression':
				reportImplicitReturnSideEffect,
			'CallExpression > FunctionExpression > BlockStatement': reportSideEffects,
		};
	},
});
