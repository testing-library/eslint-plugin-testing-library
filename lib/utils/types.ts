import { TSESLint } from '@typescript-eslint/utils';

type Recommended = 'error' | 'warn' | false;
type RecommendedConfig<TOptions extends readonly unknown[]> =
	| Recommended
	| [Recommended, ...TOptions];

export type TestingLibraryPluginDocs<TOptions extends readonly unknown[]> = {
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

export type TestingLibraryPluginRuleModule<
	TMessageIds extends string,
	TOptions extends readonly unknown[],
> = TSESLint.RuleModuleWithMetaDocs<
	TMessageIds,
	TOptions,
	TestingLibraryPluginDocs<TOptions>
>;

export const SUPPORTED_TESTING_FRAMEWORKS = [
	'dom',
	'angular',
	'react',
	'vue',
	'marko',
] as const;
export type SupportedTestingFramework =
	(typeof SUPPORTED_TESTING_FRAMEWORKS)[number];
