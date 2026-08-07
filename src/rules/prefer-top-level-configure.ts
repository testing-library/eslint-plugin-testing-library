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
 * Returns true when the given node is nested inside a test body:
 *   test('...', fn)  /  it('...', fn)  /  xit(...)  /  xtest(...)
 *   test.only(...)   /  test.skip(...)
 *   test.each([...])(...)  —  curried form where callee is a CallExpression
 */
function isInsideTestBody(node: TSESTree.Node | undefined): boolean {
	if (!node) {
		return false;
	}

	if (isCallExpression(node)) {
		const { callee } = node;

		// test('title', fn) / it('title', fn) / xit(...) / xtest(...)
		if (ASTUtils.isIdentifier(callee) && TEST_FUNCTION_NAMES.has(callee.name)) {
			return true;
		}

		// test.only('title', fn) / test.skip('title', fn) / it.each([1])(...)
		// — callee is a MemberExpression whose object is test / it
		if (
			isMemberExpression(callee) &&
			ASTUtils.isIdentifier(callee.object) &&
			TEST_FUNCTION_NAMES.has(callee.object.name)
		) {
			return true;
		}

		// test.each([1, 2])('title', fn)  — curried form
		// callee is the result of test.each([...]), i.e. a CallExpression whose
		// own callee is the MemberExpression test.each / it.each
		if (
			isCallExpression(callee) &&
			isMemberExpression(callee.callee) &&
			ASTUtils.isIdentifier(callee.callee.object) &&
			TEST_FUNCTION_NAMES.has(callee.callee.object.name)
		) {
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
