import { RuleTester, RunTests } from '@typescript-eslint/rule-tester';
import { RuleModule } from '@typescript-eslint/utils/ts-eslint';

const DEFAULT_TEST_CASE_CONFIG = {
	filename: 'MyComponent.test.js',
};

class TestingLibraryRuleTester extends RuleTester {
	run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
		ruleName: string,
		rule: RuleModule<TMessageIds, TOptions>,
		tests: RunTests<TMessageIds, TOptions>
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

export const createRuleTester = (): RuleTester => {
	return new TestingLibraryRuleTester();
};
