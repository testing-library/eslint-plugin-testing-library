import { createTestingLibraryRule } from '../../src/create-testing-library-rule';
import { addAsyncToFunctionFix } from '../../src/utils/add-async-to-function-fix';
import { createRuleTester } from '../test-utils';

import type { TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'alwaysAsync';

const rule = createTestingLibraryRule<[], MessageIds>({
	name: __filename,
	meta: {
		docs: {
			recommendedConfig: {
				dom: 'error',
				angular: 'error',
				react: 'error',
				vue: 'error',
				svelte: 'error',
				marko: 'error',
			},
			description: 'Fake rule for testing addAsyncToFunctionFix',
		},
		messages: { alwaysAsync: 'Function should be async' },
		schema: [],
		fixable: 'code',
		type: 'problem',
	},
	defaultOptions: [],
	create(context) {
		const reportIfNotAsync = (
			node:
				| TSESTree.FunctionExpression
				| TSESTree.FunctionDeclaration
				| TSESTree.ArrowFunctionExpression
		) => {
			if (!node.async) {
				context.report({
					node,
					messageId: 'alwaysAsync',
					fix(fixer) {
						return addAsyncToFunctionFix(
							fixer,
							fixer.insertTextBefore(node, ''),
							node
						);
					},
				});
			}
		};
		return {
			FunctionExpression: reportIfNotAsync,
			ArrowFunctionExpression: reportIfNotAsync,
			FunctionDeclaration: reportIfNotAsync,
		};
	},
});

const ruleTester = createRuleTester();

ruleTester.run(addAsyncToFunctionFix.name, rule, {
	valid: [
		{ code: 'async function foo() {}' },
		{ code: 'const bar = async function() {}' },
		{
			code: `
			async function foo(a, b) {
				return a + b;
			}`,
		},
	],
	invalid: [
		{
			code: 'const bar = function() {}',
			output: 'const bar = async function() {}',
			errors: [{ messageId: 'alwaysAsync' }],
		},
		{
			code: 'const bar = () => {}',
			output: 'const bar = async () => {}',
			errors: [{ messageId: 'alwaysAsync' }],
		},
		{
			code: `
			function foo(a, b) {
  			return a + b;
			}`,
			output: `
			async function foo(a, b) {
  			return a + b;
			}`,
			errors: [{ messageId: 'alwaysAsync', line: 2 }],
		},
		{
			code: `
			const bar = async function() {}
			const foo = function() {}
			`,
			output: `
			const bar = async function() {}
			const foo = async function() {}
			`,
			errors: [{ messageId: 'alwaysAsync', line: 3 }],
		},
		{
			code: `
			const bar = function() {}
			const foo = function() {}
			`,
			output: `
			const bar = async function() {}
			const foo = async function() {}
			`,
			errors: [
				{ messageId: 'alwaysAsync', line: 2 },
				{ messageId: 'alwaysAsync', line: 3 },
			],
		},
	],
});
