import type { TSESLint } from '@typescript-eslint/experimental-utils';

type RecommendedConfig<TOptions extends readonly unknown[]> =
  | TSESLint.RuleMetaDataDocs['recommended']
  | [TSESLint.RuleMetaDataDocs['recommended'], ...TOptions];

// These 2 types are copied from @typescript-eslint/experimental-utils' CreateRuleMeta
// and modified to our needs
type TestingLibraryRuleMetaDocs<TOptions extends readonly unknown[]> = Omit<
  TSESLint.RuleMetaDataDocs,
  'recommended' | 'url'
> & {
  recommended: Record<SupportedTestingFramework, RecommendedConfig<TOptions>>;
};
export type TestingLibraryRuleMeta<
  TMessageIds extends string,
  TOptions extends readonly unknown[]
> = {
  docs: TestingLibraryRuleMetaDocs<TOptions>;
} & Omit<TSESLint.RuleMetaData<TMessageIds>, 'docs'>;

export const SUPPORTED_TESTING_FRAMEWORKS = [
  'dom',
  'angular',
  'react',
  'vue',
] as const;
export type SupportedTestingFramework = typeof SUPPORTED_TESTING_FRAMEWORKS[number];
