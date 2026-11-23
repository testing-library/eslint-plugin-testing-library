import { isAwaitExpression } from '@typescript-eslint/utils/ast-utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getPropertyIdentifierNode,
	isExpressionStatement,
	isVariableDeclaration,
	isAssignmentExpression,
	isCallExpression,
	isSequenceExpression,
	hasThenProperty,
} from '../node-utils';
import { getSourceCode } from '../utils';

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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

					return (
						helpers.isFireEventUtil(test) ||
						helpers.isUserEventUtil(test) ||
						helpers.isRenderUtil(test)
					);
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

				const expressionIdentifier = getPropertyIdentifierNode(node);

				if (!expressionIdentifier) {
					return false;
				}

				return (
					helpers.isFireEventUtil(expressionIdentifier) ||
					helpers.isUserEventUtil(expressionIdentifier) ||
					helpers.isRenderUtil(expressionIdentifier)
				);
			}) as TSESTree.ExpressionStatement[];
		}

		/**
		 * Checks if the given node is the start of the expression statement
		 * it is in, so nothing in that statement runs before it.
		 */
		function startsStatement(node: TSESTree.Node): boolean {
			let current: TSESTree.Node | undefined = node.parent;
			while (current && !isExpressionStatement(current)) {
				current = current.parent;
			}
			return current?.range[0] === node.range[0];
		}

		/**
		 * Checks if no other code shares the lines of the given node,
		 * so the fix can safely move whole lines.
		 */
		function isAloneOnItsLines(node: TSESTree.Node): boolean {
			const tokenBefore = sourceCode.getTokenBefore(node);
			const tokenAfter = sourceCode.getTokenAfter(node);

			return (
				(!tokenBefore || tokenBefore.loc.end.line < node.loc.start.line) &&
				(!tokenAfter || tokenAfter.loc.start.line > node.loc.end.line)
			);
		}

		/**
		 * Moves a side effect that shares its line with other code
		 * (e.g. `await waitFor(() => { fireEvent.click(button); });`)
		 * by using its own range instead of whole lines.
		 */
		function fixSideEffectSharingLine(
			fixer: TSESLint.RuleFixer,
			sideEffectNode: TSESTree.Node,
			targetNode: TSESTree.Node,
			isOnlyStatement: boolean
		): TSESLint.RuleFix[] {
			const sideEffectText = sourceCode.getText(sideEffectNode);

			if (isOnlyStatement) {
				// the side effect is the only statement: replace the whole `waitFor`
				const tokenAfter = sourceCode.getTokenAfter(targetNode);
				return [
					fixer.replaceTextRange(
						[
							targetNode.range[0],
							tokenAfter?.value === ';'
								? tokenAfter.range[1]
								: targetNode.range[1],
						],
						sideEffectText
					),
				];
			}

			const tokenBeforeTarget = sourceCode.getTokenBefore(targetNode);
			const targetStartsLine =
				!tokenBeforeTarget ||
				tokenBeforeTarget.loc.end.line < targetNode.loc.start.line;
			const targetLine = sourceCode.lines[targetNode.loc.start.line - 1];
			const indent = targetLine?.match(/^\s*/)?.[0] ?? '';
			const separator = targetStartsLine ? `\n${indent}` : ' ';

			// remove the side effect along with the spaces that follow it on the
			// same line or, when it ends its line, the spaces before it
			const tokenAfter = sourceCode.getTokenAfter(sideEffectNode);
			const removeRange: TSESTree.Range =
				tokenAfter && tokenAfter.loc.start.line === sideEffectNode.loc.end.line
					? [sideEffectNode.range[0], tokenAfter.range[0]]
					: [
							sourceCode.getTokenBefore(sideEffectNode)?.range[1] ??
								sideEffectNode.range[0],
							sideEffectNode.range[1],
						];

			return [
				fixer.insertTextBefore(targetNode, sideEffectText + separator),
				fixer.removeRange(removeRange),
			];
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

						// side effects are moved right before `waitFor`, so it must start
						// its statement (`await waitFor(...)`, `waitFor(...).then(...)`);
						// in `foo(await waitFor(...))` that would break the code or change
						// what it does
						if (!startsStatement(targetNode)) {
							return null;
						}
						// with no other statements left, the whole `waitFor` is replaced
						const isOnlyStatement =
							node.body.length === 1 &&
							isExpressionStatement(targetNode.parent);

						if (!isAloneOnItsLines(sideEffectNode)) {
							return fixSideEffectSharingLine(
								fixer,
								sideEffectNode,
								targetNode,
								isOnlyStatement
							);
						}

						const lines = sourceCode.getText().split('\n');
						const line = lines[targetNode.loc.start.line - 1];
						const indent = line?.match(/^\s*/)?.[0] ?? '';
						const sideEffectLines = lines.slice(
							sideEffectNode.loc.start.line - 1,
							sideEffectNode.loc.end.line
						);
						const sideEffectNodeText = sideEffectLines.join('\n').trimStart();
						if (isOnlyStatement) {
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

			if (
				expressionIdentifier &&
				!helpers.isFireEventUtil(expressionIdentifier) &&
				!helpers.isUserEventUtil(expressionIdentifier) &&
				!helpers.isRenderUtil(expressionIdentifier)
			) {
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
