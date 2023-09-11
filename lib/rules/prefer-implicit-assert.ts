import { TSESTree, ASTUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { isCallExpression, isMemberExpression } from '../node-utils';
import { PRESENCE_MATCHERS, ABSENCE_MATCHERS } from '../utils';

export const RULE_NAME = 'prefer-implicit-assert';
export type MessageIds = 'preferImplicitAssert';
type Options = [];

const isCalledUsingSomeObject = (node: TSESTree.Identifier) =>
	isMemberExpression(node.parent) &&
	node.parent.object.type === AST_NODE_TYPES.Identifier;

const isCalledInExpect = (
	node: TSESTree.Identifier | TSESTree.Node,
	isAsyncQuery: boolean
) => {
	if (isAsyncQuery) {
		return (
			isCallExpression(node.parent) &&
			ASTUtils.isAwaitExpression(node.parent.parent) &&
			isCallExpression(node.parent.parent.parent) &&
			ASTUtils.isIdentifier(node.parent.parent.parent.callee) &&
			node.parent.parent.parent.callee.name === 'expect'
		);
	}
	return (
		isCallExpression(node.parent) &&
		isCallExpression(node.parent.parent) &&
		ASTUtils.isIdentifier(node.parent.parent.callee) &&
		node.parent.parent.callee.name === 'expect'
	);
};

const usesPresenceAssertion = (
	node: TSESTree.Identifier | TSESTree.Node,
	isAsyncQuery: boolean
) => {
	if (isAsyncQuery) {
		return (
			isMemberExpression(node.parent?.parent?.parent?.parent) &&
			node.parent?.parent?.parent?.parent.property.type ===
				AST_NODE_TYPES.Identifier &&
			PRESENCE_MATCHERS.includes(node.parent.parent.parent.parent.property.name)
		);
	}
	return (
		isMemberExpression(node.parent?.parent?.parent) &&
		node.parent?.parent?.parent.property.type === AST_NODE_TYPES.Identifier &&
		PRESENCE_MATCHERS.includes(node.parent.parent.parent.property.name)
	);
};

const usesNotPresenceAssertion = (
	node: TSESTree.Identifier | TSESTree.Node,
	isAsyncQuery: boolean
) => {
	if (isAsyncQuery) {
		return (
			isMemberExpression(node.parent?.parent?.parent?.parent) &&
			node.parent?.parent?.parent?.parent.property.type ===
				AST_NODE_TYPES.Identifier &&
			node.parent.parent.parent.parent.property.name === 'not' &&
			isMemberExpression(node.parent.parent.parent.parent.parent) &&
			node.parent.parent.parent.parent.parent.property.type ===
				AST_NODE_TYPES.Identifier &&
			ABSENCE_MATCHERS.includes(
				node.parent.parent.parent.parent.parent.property.name
			)
		);
	}
	return (
		isMemberExpression(node.parent?.parent?.parent) &&
		node.parent?.parent?.parent.property.type === AST_NODE_TYPES.Identifier &&
		node.parent.parent.parent.property.name === 'not' &&
		isMemberExpression(node.parent.parent.parent.parent) &&
		node.parent.parent.parent.parent.property.type ===
			AST_NODE_TYPES.Identifier &&
		ABSENCE_MATCHERS.includes(node.parent.parent.parent.parent.property.name)
	);
};

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Suggest using implicit assertions for getBy* & findBy* queries',
			recommendedConfig: {
				dom: false,
				angular: false,
				react: false,
				vue: false,
				marko: false,
			},
		},
		messages: {
			preferImplicitAssert:
				"Don't wrap `{{queryType}}` query with `expect` & presence matchers like `toBeInTheDocument` or `not.toBeNull` as `{{queryType}}` queries fail implicitly when element is not found",
		},
		schema: [],
	},
	defaultOptions: [],
	create(context, _, helpers) {
		const findQueryCalls: TSESTree.Identifier[] = [];
		const getQueryCalls: TSESTree.Identifier[] = [];

		return {
			'CallExpression Identifier'(node: TSESTree.Identifier) {
				if (helpers.isFindQueryVariant(node)) {
					findQueryCalls.push(node);
				}
				if (helpers.isGetQueryVariant(node)) {
					getQueryCalls.push(node);
				}
			},
			'Program:exit'() {
				let isAsyncQuery = true;
				findQueryCalls.forEach((queryCall) => {
					const node: TSESTree.Identifier | TSESTree.Node | undefined =
						isCalledUsingSomeObject(queryCall) ? queryCall.parent : queryCall;

					if (node) {
						if (
							isCalledInExpect(node, isAsyncQuery) &&
							usesPresenceAssertion(node, isAsyncQuery)
						) {
							return context.report({
								node: queryCall,
								messageId: 'preferImplicitAssert',
								data: {
									queryType: 'findBy*',
								},
							});
						}

						if (
							isCalledInExpect(node, isAsyncQuery) &&
							usesNotPresenceAssertion(node, isAsyncQuery)
						) {
							return context.report({
								node: queryCall,
								messageId: 'preferImplicitAssert',
								data: {
									queryType: 'findBy*',
								},
							});
						}
					}
				});

				getQueryCalls.forEach((queryCall) => {
					isAsyncQuery = false;
					const node: TSESTree.Identifier | TSESTree.Node | undefined =
						isCalledUsingSomeObject(queryCall) ? queryCall.parent : queryCall;
					if (node) {
						if (
							isCalledInExpect(node, isAsyncQuery) &&
							usesPresenceAssertion(node, isAsyncQuery)
						) {
							return context.report({
								node: queryCall,
								messageId: 'preferImplicitAssert',
								data: {
									queryType: 'getBy*',
								},
							});
						}

						if (
							isCalledInExpect(node, isAsyncQuery) &&
							usesNotPresenceAssertion(node, isAsyncQuery)
						) {
							return context.report({
								node: queryCall,
								messageId: 'preferImplicitAssert',
								data: {
									queryType: 'getBy*',
								},
							});
						}
					}
				});
			},
		};
	},
});
