import {
	TSESTree,
	ASTUtils,
	AST_NODE_TYPES,
	TSESLint,
} from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import { TestingLibrarySettings } from '../create-testing-library-rule/detect-testing-library-utils';
import { isCallExpression, isMemberExpression } from '../node-utils';

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

const reportError = (
	context: Readonly<
		TSESLint.RuleContext<'preferImplicitAssert', []> & {
			settings: TestingLibrarySettings;
		}
	>,
	node: TSESTree.Identifier | TSESTree.Node | undefined,
	queryType: string
) => {
	if (node) {
		return context.report({
			node,
			messageId: 'preferImplicitAssert',
			data: {
				queryType,
			},
		});
	}
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
				svelte: false,
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
				findQueryCalls.forEach((queryCall) => {
					const isAsyncQuery = true;
					const node: TSESTree.Identifier | TSESTree.Node | undefined =
						isCalledUsingSomeObject(queryCall) ? queryCall.parent : queryCall;

					if (node) {
						if (isCalledInExpect(node, isAsyncQuery)) {
							if (
								isMemberExpression(node.parent?.parent?.parent?.parent) &&
								node.parent?.parent?.parent?.parent.property.type ===
									AST_NODE_TYPES.Identifier &&
								helpers.isPresenceAssert(node.parent.parent.parent.parent)
							) {
								return reportError(context, node, 'findBy*');
							}
						}
					}
				});

				getQueryCalls.forEach((queryCall) => {
					const isAsyncQuery = false;
					const node: TSESTree.Identifier | TSESTree.Node | undefined =
						isCalledUsingSomeObject(queryCall) ? queryCall.parent : queryCall;
					if (node) {
						if (isCalledInExpect(node, isAsyncQuery)) {
							if (
								isMemberExpression(node.parent?.parent?.parent) &&
								node.parent?.parent?.parent.property.type ===
									AST_NODE_TYPES.Identifier &&
								helpers.isPresenceAssert(node.parent.parent.parent)
							) {
								return reportError(context, node, 'getBy*');
							}
						}
					}
				});
			},
		};
	},
});
