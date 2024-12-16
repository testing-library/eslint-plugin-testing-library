import tsESLintParser from '@typescript-eslint/parser';
import { RuleTester, RunTests } from '@typescript-eslint/rule-tester';
import { TSUtils } from '@typescript-eslint/utils';

import { TestingLibraryPluginRuleModule } from '../../lib/utils';

const DEFAULT_TEST_CASE_CONFIG = {
	filename: 'MyComponent.test.js',
};

class TestingLibraryRuleTester extends RuleTester {
	run<TMessageIds extends string, TOptions extends readonly unknown[]>(
		ruleName: string,
		rule: TestingLibraryPluginRuleModule<TMessageIds, TOptions>,
		test: RunTests<TSUtils.NoInfer<TMessageIds>, TSUtils.NoInfer<TOptions>>
	): void {
		const { valid, invalid } = test;
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

export const createRuleTester = () =>
	new TestingLibraryRuleTester({
		languageOptions: {
			parser: tsESLintParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	});
