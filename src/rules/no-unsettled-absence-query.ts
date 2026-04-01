import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallNode,
	getAssertNodeInfo,
	getDeepestIdentifierNode,
	isArrowFunctionExpression,
	isBlockStatement,
	isCallExpression,
	isFunctionDeclaration,
	isFunctionExpression,
	isMemberExpression,
} from '../node-utils';

import type { TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'no-unsettled-absence-query';
export type MessageIds = 'noUnsettledAbsenceQuery';
export type Options = [];

const NEGATED_ABSENCE_MATCHERS = ['toBeVisible'];

function isNestedFunction(node: TSESTree.Node): boolean {
	return (
		isArrowFunctionExpression(node) ||
		isFunctionExpression(node) ||
		isFunctionDeclaration(node)
	);
}

function containsNode(
	node: TSESTree.Node,
	predicate: (n: TSESTree.Node) => boolean
): boolean {
	if (predicate(node)) {
		return true;
	}

	if (isNestedFunction(node)) {
		return false;
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
						containsNode(item as TSESTree.Node, predicate)
					) {
						return true;
					}
				}
			} else if (
				'type' in child &&
				containsNode(child as TSESTree.Node, predicate)
			) {
				return true;
			}
		}
	}
	return false;
}

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

		function hasSettlingExpression(statement: TSESTree.Statement): boolean {
			const hasAwait = containsNode(statement, (n) =>
				ASTUtils.isAwaitExpression(n)
			);
			const hasGetQuery = containsNode(
				statement,
				(n) => ASTUtils.isIdentifier(n) && helpers.isGetQueryVariant(n)
			);
			return hasAwait || hasGetQuery;
		}

		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				if (!helpers.isQueryQueryVariant(node)) {
					return;
				}

				const expectCallNode = findClosestCallNode(node, 'expect');
				if (
					!expectCallNode?.parent ||
					!isMemberExpression(expectCallNode.parent)
				) {
					return;
				}

				if (!isAbsenceAssertion(expectCallNode.parent)) {
					return;
				}

				if (isInsideAsyncUtilCallback(node)) {
					context.report({
						node,
						messageId: 'noUnsettledAbsenceQuery',
						data: { queryMethod: node.name },
					});
					return;
				}

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
