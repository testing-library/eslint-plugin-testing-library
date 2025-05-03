import { TSESTree, ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	findClosestCallNode,
	isCallExpression,
	isMemberExpression,
} from '../node-utils';
import { PRESENCE_MATCHERS, ABSENCE_MATCHERS } from '../utils';

export const RULE_NAME = 'prefer-explicit-assert';
export type MessageIds =
	| 'preferExplicitAssert'
	| 'preferExplicitAssertAssertion';
type Options = [
	{
		assertion?: string;
		includeFindQueries?: boolean;
	},
];

const isAtTopLevel = (node: TSESTree.Node) =>
	(!!node.parent?.parent &&
		node.parent.parent.type === TSESTree.AST_NODE_TYPES.ExpressionStatement) ||
	(node.parent?.parent?.type === TSESTree.AST_NODE_TYPES.AwaitExpression &&
		!!node.parent.parent.parent &&
		node.parent.parent.parent.type ===
			TSESTree.AST_NODE_TYPES.ExpressionStatement);

const isVariableDeclaration = (node: TSESTree.Node) => {
	if (
		isCallExpression(node.parent) &&
		ASTUtils.isAwaitExpression(node.parent.parent) &&
		ASTUtils.isVariableDeclarator(node.parent.parent.parent)
	) {
		return true; // const quxElement = await findByLabelText('qux')
	}

	if (
		isCallExpression(node.parent) &&
		ASTUtils.isVariableDeclarator(node.parent.parent)
	) {
		return true; // const quxElement = findByLabelText('qux')
	}

	if (
		isMemberExpression(node.parent) &&
		isCallExpression(node.parent.parent) &&
		ASTUtils.isAwaitExpression(node.parent.parent.parent) &&
		ASTUtils.isVariableDeclarator(node.parent.parent.parent.parent)
	) {
		return true; // const quxElement = await screen.findByLabelText('qux')
	}

	if (
		isMemberExpression(node.parent) &&
		isCallExpression(node.parent.parent) &&
		ASTUtils.isVariableDeclarator(node.parent.parent.parent)
	) {
		return true; // const quxElement = screen.findByLabelText('qux')
	}

	return false;
};

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Suggest using explicit assertions rather than standalone queries',
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
			preferExplicitAssert:
				'Wrap stand-alone `{{queryType}}` query with `expect` function for better explicit assertion',
			preferExplicitAssertAssertion:
				'`getBy*` queries must be asserted with `{{assertion}}`', // TODO: support findBy* queries as well
		},
		schema: [
			{
				type: 'object',
				additionalProperties: false,
				properties: {
					assertion: {
						type: 'string',
						enum: PRESENCE_MATCHERS,
					},
					includeFindQueries: { type: 'boolean' },
				},
			},
		],
	},
	defaultOptions: [{ includeFindQueries: true }],
	create(context, [options], helpers) {
		const { assertion, includeFindQueries } = options;
		const getQueryCalls: TSESTree.Identifier[] = [];
		const findQueryCalls: TSESTree.Identifier[] = [];

		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				if (helpers.isGetQueryVariant(node)) {
					getQueryCalls.push(node);
				}

				if (helpers.isFindQueryVariant(node)) {
					findQueryCalls.push(node);
				}
			},
			'Program:exit'() {
				if (includeFindQueries) {
					findQueryCalls.forEach((queryCall) => {
						const memberExpression = isMemberExpression(queryCall.parent)
							? queryCall.parent
							: queryCall;

						if (
							isVariableDeclaration(queryCall) ||
							!isAtTopLevel(memberExpression)
						) {
							return;
						}

						context.report({
							node: queryCall,
							messageId: 'preferExplicitAssert',
							data: {
								queryType: 'findBy*',
							},
						});
					});
				}

				getQueryCalls.forEach((queryCall) => {
					const node = isMemberExpression(queryCall.parent)
						? queryCall.parent
						: queryCall;

					if (isAtTopLevel(node)) {
						context.report({
							node: queryCall,
							messageId: 'preferExplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						});
					}

					if (assertion) {
						const expectCallNode = findClosestCallNode(node, 'expect');
						if (!expectCallNode) return;

						const expectStatement = expectCallNode.parent;
						if (!isMemberExpression(expectStatement)) {
							return;
						}

						const property = expectStatement.property;

						if (!ASTUtils.isIdentifier(property)) {
							return;
						}

						let matcher = property.name;
						let isNegatedMatcher = false;

						if (
							matcher === 'not' &&
							isMemberExpression(expectStatement.parent) &&
							ASTUtils.isIdentifier(expectStatement.parent.property)
						) {
							isNegatedMatcher = true;
							matcher = expectStatement.parent.property.name;
						}

						const shouldEnforceAssertion =
							(!isNegatedMatcher && PRESENCE_MATCHERS.includes(matcher)) ||
							(isNegatedMatcher && ABSENCE_MATCHERS.includes(matcher));

						if (shouldEnforceAssertion && matcher !== assertion) {
							context.report({
								node: property,
								messageId: 'preferExplicitAssertAssertion',
								data: {
									assertion,
								},
							});
						}
					}
				});
			},
		};
	},
});
