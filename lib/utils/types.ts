import type { TSESLint } from '@typescript-eslint/experimental-utils';

// These 2 types are copied from @typescript-eslint/experimental-utils' CreateRuleMeta
// and modified to our needs
type TestingLibraryRuleMetaDocs = Omit<
  TSESLint.RuleMetaDataDocs,
  'recommended' | 'url'
> & {
  recommended: Record<
    SupportedTestingFramework,
    TSESLint.RuleMetaDataDocs['recommended']
  >;
};
export type TestingLibraryRuleMeta<TMessageIds extends string> = {
  docs: TestingLibraryRuleMetaDocs;
} & Omit<TSESLint.RuleMetaData<TMessageIds>, 'docs'>;

export const SUPPORTED_TESTING_FRAMEWORKS = [
  'dom',
  'angular',
  'react',
  'vue',
] as const;
export type SupportedTestingFramework = typeof SUPPORTED_TESTING_FRAMEWORKS[number];
