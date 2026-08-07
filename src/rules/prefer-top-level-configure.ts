import { ASTUtils } from '@typescript-eslint/utils';

import { createTestingLibraryRule } from '../create-testing-library-rule';
import {
	getDeepestIdentifierNode,
	isCallExpression,
	isImportSpecifier,
	isMemberExpression,
} from '../node-utils';

import type { TSESTree } from '@typescript-eslint/utils';

const RULE_NAME = 'prefer-top-level-configure';
export type MessageIds = 'preferTopLevelConfigure';
type Options = [];

const TEST_FUNCTION_NAMES = new Set(['it', 'test', 'xit', 'xtest']);

/**
 * Walks a (possibly chained) MemberExpression or CallExpression leftward to
 * find the root Identifier name. Handles all of:
 *   test                → 'test'
 *   test.only           → 'test'
 *   test.only.each      → 'test'
 *   test.each([…])      → 'test'  (CallExpression whose callee is a chain)
 */
function getRootIdentifierName(
	node: TSESTree.Expression | TSESTree.PrivateIdentifier
): string | undefined {
	if (ASTUtils.isIdentifier(node)) {
		return node.name;
	}
	if (isMemberExpression(node)) {
		return getRootIdentifierName(node.object);
	}
	if (isCallExpression(node)) {
		return getRootIdentifierName(node.callee);
	}
	return undefined;
}

/**
 * Returns true when the given node is nested inside a test body:
 *   test('...', fn)  /  it('...', fn)  /  xit(...)  /  xtest(...)
 *   test.only(...)   /  test.skip(...)
 *   test.each([...])(...)  /  test.only.each([...])(...)  — curried forms
 */
function isInsideTestBody(node: TSESTree.Node | undefined): boolean {
	if (!node) {
		return false;
	}

	if (isCallExpression(node)) {
		const rootName = getRootIdentifierName(node.callee);
		if (rootName !== undefined && TEST_FUNCTION_NAMES.has(rootName)) {
			return true;
		}
	}

	return isInsideTestBody(node.parent);
}

export default createTestingLibraryRule<Options, MessageIds>({
	name: RULE_NAME,
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow calling `configure` inside test functions to avoid cross-test side effects',
			recommendedConfig: {
				dom: 'warn',
				angular: 'warn',
				react: 'warn',
				vue: 'warn',
				svelte: 'warn',
				marko: 'warn',
			},
		},
		messages: {
			preferTopLevelConfigure:
				'Avoid calling `configure` inside a test. Move it to the top level or a `beforeAll`/`beforeEach` hook.',
		},
		schema: [],
	},
	defaultOptions: [],

	create(context, _, helpers) {
		return {
			CallExpression(node) {
				const calleeIdentifier = getDeepestIdentifierNode(node);
				if (!calleeIdentifier) {
					return;
				}

				// Resolve the import specifier for this local identifier name and
				// verify the original exported name is 'configure'.
				// This handles both direct imports and aliased imports:
				//   import { configure } from '@testing-library/react'
				//   import { configure as tlConfigure } from '@testing-library/react'
				const specifier = helpers.findImportedTestingLibraryUtilSpecifier(
					calleeIdentifier.name
				);

				if (
					!specifier ||
					!isImportSpecifier(specifier) ||
					!ASTUtils.isIdentifier(specifier.imported) ||
					specifier.imported.name !== 'configure'
				) {
					return;
				}

				if (isInsideTestBody(node.parent)) {
					context.report({
						node: calleeIdentifier,
						messageId: 'preferTopLevelConfigure',
					});
				}
			},
		};
	},
});
