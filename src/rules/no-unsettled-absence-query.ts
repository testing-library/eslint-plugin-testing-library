import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallNode,
	getAssertNodeInfo,
	getDeepestIdentifierNode,
	isArrowFunctionExpression,
	isBlockStatement,
	isCallExpression,
	isFunctionExpression,
	isMemberExpression,
} from '../node-utils';

import type { TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'no-unsettled-absence-query';
export type MessageIds = 'noUnsettledAbsenceQuery';
export type Options = [];

// Matchers that indicate absence when negated, beyond those already
// covered by helpers.isAbsenceAssert() (which handles PRESENCE_MATCHERS).
const NEGATED_ABSENCE_MATCHERS = ['toBeVisible'];

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow absence assertions on `queryBy*` before the component has settled',
			recommendedConfig: {
				dom: false,
				angular: false,
				react: false,
				vue: false,
				svelte: false,
				marko: false,
			},
		},
		messages: {
			noUnsettledAbsenceQuery:
				'Absence assertion on `{{queryMethod}}` appears before the component has settled. ' +
				'The element may not have rendered yet, resulting in a false positive. ' +
				'Add an `await` expression (e.g. `findBy*`, `waitFor`, `act`) or a `getBy*` call before this assertion.',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		function isAbsenceAssertion(node: TSESTree.MemberExpression): boolean {
			if (helpers.isAbsenceAssert(node)) {
				return true;
			}

			const { matcher, isNegated } = getAssertNodeInfo(node);
			return (
				isNegated !== false &&
				matcher !== null &&
				NEGATED_ABSENCE_MATCHERS.includes(matcher)
			);
		}

		/**
		 * Determines whether a node is inside a callback passed to an async
		 * Testing Library utility (e.g. waitFor). Absence assertions inside
		 * these callbacks are always flagged because they can pass on the first
		 * invocation before the component has settled.
		 */
		function isInsideAsyncUtilCallback(node: TSESTree.Node): boolean {
			let current: TSESTree.Node | undefined = node.parent;

			while (current) {
				if (
					(isArrowFunctionExpression(current) ||
						isFunctionExpression(current)) &&
					isCallExpression(current.parent)
				) {
					const calleeIdentifier = getDeepestIdentifierNode(
						current.parent.callee
					);
					if (calleeIdentifier && helpers.isAsyncUtil(calleeIdentifier)) {
						return true;
					}
				}
				current = current.parent;
			}
			return false;
		}

		function findEnclosingFunctionBody(
			node: TSESTree.Node
		): TSESTree.Statement[] | null {
			let current: TSESTree.Node | undefined = node.parent;

			while (current) {
				if (
					(isArrowFunctionExpression(current) ||
						isFunctionExpression(current)) &&
					isBlockStatement(current.body)
				) {
					return current.body.body;
				}
				current = current.parent;
			}
			return null;
		}

		function findAncestorStatement(
			node: TSESTree.Node,
			statements: TSESTree.Statement[]
		): TSESTree.Statement | null {
			let current: TSESTree.Node = node;
			while (current.parent) {
				if (statements.includes(current as TSESTree.Statement)) {
					return current as TSESTree.Statement;
				}
				current = current.parent;
			}
			return null;
		}

		function containsAwaitExpression(node: TSESTree.Node): boolean {
			if (ASTUtils.isAwaitExpression(node)) {
				return true;
			}

			for (const key of Object.keys(node)) {
				if (key === 'parent') continue;
				const child = (node as unknown as Record<string, unknown>)[key];
				if (child && typeof child === 'object') {
					if (Array.isArray(child)) {
						for (const item of child) {
							if (
								item &&
								typeof item === 'object' &&
								'type' in item &&
								containsAwaitExpression(item as TSESTree.Node)
							) {
								return true;
							}
						}
					} else if (
						'type' in child &&
						containsAwaitExpression(child as TSESTree.Node)
					) {
						return true;
					}
				}
			}
			return false;
		}

		function containsGetQueryCall(node: TSESTree.Node): boolean {
			if (ASTUtils.isIdentifier(node) && helpers.isGetQueryVariant(node)) {
				return true;
			}

			for (const key of Object.keys(node)) {
				if (key === 'parent') continue;
				const child = (node as unknown as Record<string, unknown>)[key];
				if (child && typeof child === 'object') {
					if (Array.isArray(child)) {
						for (const item of child) {
							if (
								item &&
								typeof item === 'object' &&
								'type' in item &&
								containsGetQueryCall(item as TSESTree.Node)
							) {
								return true;
							}
						}
					} else if (
						'type' in child &&
						containsGetQueryCall(child as TSESTree.Node)
					) {
						return true;
					}
				}
			}
			return false;
		}

		function hasSettlingExpression(statement: TSESTree.Statement): boolean {
			return (
				containsAwaitExpression(statement) || containsGetQueryCall(statement)
			);
		}

		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				// Only interested in queryBy* / queryAllBy* variants
				if (!helpers.isQueryQueryVariant(node)) {
					return;
				}

				// Must be inside an expect() call
				const expectCallNode = findClosestCallNode(node, 'expect');
				if (
					!expectCallNode?.parent ||
					!isMemberExpression(expectCallNode.parent)
				) {
					return;
				}

				// Must be an absence assertion
				if (!isAbsenceAssertion(expectCallNode.parent)) {
					return;
				}

				// Absence assertions inside async util callbacks (e.g. waitFor) are
				// always flagged — they pass on the first invocation before the
				// component has settled.
				if (isInsideAsyncUtilCallback(node)) {
					context.report({
						node,
						messageId: 'noUnsettledAbsenceQuery',
						data: { queryMethod: node.name },
					});
					return;
				}

				// Find the enclosing function body and determine whether a settling
				// expression appears on any preceding statement.
				const functionBody = findEnclosingFunctionBody(node);
				if (!functionBody) {
					return;
				}

				const containingStatement = findAncestorStatement(node, functionBody);
				if (!containingStatement) {
					return;
				}

				const stmtIndex = functionBody.indexOf(containingStatement);
				const precedingStatements = functionBody.slice(0, stmtIndex);
				const hasSettled = precedingStatements.some(hasSettlingExpression);

				if (!hasSettled) {
					context.report({
						node,
						messageId: 'noUnsettledAbsenceQuery',
						data: { queryMethod: node.name },
					});
				}
			},
		};
	},
});
