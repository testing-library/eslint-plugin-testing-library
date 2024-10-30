import { type TSESLint } from '@typescript-eslint/utils';

type Recommended = 'error' | 'warn' | false;
type RecommendedConfig<TOptions extends readonly unknown[]> =
	| Recommended
	| [Recommended, ...TOptions];

// These 2 types are copied from `@typescript-eslint/utils`' `CreateRuleMeta`
// and modified to our needs
export type TestingLibraryRuleMetaDocs<TOptions extends readonly unknown[]> =
	Omit<TSESLint.RuleMetaDataDocs, 'recommended' | 'url'> & {
		/**
		 * The recommendation level for the rule on a framework basis.
		 * Used by the build tools to generate the framework config.
		 * Set to `false` to not include it the config
		 */
		recommendedConfig: Record<
			SupportedTestingFramework,
			RecommendedConfig<TOptions>
		>;
	};
export type TestingLibraryRuleMeta<
	TMessageIds extends string,
	TOptions extends readonly unknown[],
> = Omit<TSESLint.RuleMetaData<TMessageIds>, 'docs'> & {
	docs: TestingLibraryRuleMetaDocs<TOptions>;
};

export const SUPPORTED_TESTING_FRAMEWORKS = [
	'dom',
	'angular',
	'react',
	'vue',
	'marko',
] as const;
export type SupportedTestingFramework =
	(typeof SUPPORTED_TESTING_FRAMEWORKS)[number];
