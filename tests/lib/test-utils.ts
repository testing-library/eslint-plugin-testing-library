import { resolve } from 'path';

import { TSESLint } from '@typescript-eslint/utils';

const DEFAULT_TEST_CASE_CONFIG = {
	filename: 'MyComponent.test.js',
};

class TestingLibraryRuleTester extends TSESLint.RuleTester {
	run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
		ruleName: string,
		rule: TSESLint.RuleModule<TMessageIds, TOptions>,
		tests: TSESLint.RunTests<TMessageIds, TOptions>,
	): void {
		const { valid, invalid } = tests;

		const finalValid = valid.map((testCase) => {
			if (typeof testCase === 'string') {
				return {
					...DEFAULT_TEST_CASE_CONFIG,
					code: testCase,
				};
			}

			return { ...DEFAULT_TEST_CASE_CONFIG, ...testCase };
		});
		const finalInvalid = invalid.map((testCase) => ({
			...DEFAULT_TEST_CASE_CONFIG,
			...testCase,
		}));

		super.run(ruleName, rule, { valid: finalValid, invalid: finalInvalid });
	}
}

export const createRuleTester = (
	parserOptions: Partial<TSESLint.ParserOptions> = {},
): TSESLint.RuleTester => {
	return new TestingLibraryRuleTester({
		parser: resolve('./node_modules/@typescript-eslint/parser'),
		parserOptions: {
			ecmaVersion: 2018,
			sourceType: 'module',
			ecmaFeatures: {
				jsx: true,
			},
			...parserOptions,
		},
	});
};
