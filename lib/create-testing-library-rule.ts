import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from './utils';
import {
  DetectionOptions,
  detectTestingLibraryUtils,
  EnhancedRuleCreate,
} from './detect-testing-library-utils';

// These 2 types are copied from @typescript-eslint/experimental-utils
type CreateRuleMetaDocs = Omit<TSESLint.RuleMetaDataDocs, 'url'>;
type CreateRuleMeta<TMessageIds extends string> = {
  docs: CreateRuleMetaDocs;
} & Omit<TSESLint.RuleMetaData<TMessageIds>, 'docs'>;

export function createTestingLibraryRule<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends TSESLint.RuleListener = TSESLint.RuleListener
>(
  config: Readonly<{
    name: string;
    meta: CreateRuleMeta<TMessageIds>;
    defaultOptions: Readonly<TOptions>;
    create: EnhancedRuleCreate<TOptions, TMessageIds, TRuleListener>;
    detectionOptions?: Partial<DetectionOptions>;
  }>
): TSESLint.RuleModule<TMessageIds, TOptions> {
  const { create, detectionOptions, ...remainingConfig } = config;

  return ESLintUtils.RuleCreator(getDocsUrl)({
    ...remainingConfig,
    create: detectTestingLibraryUtils<TOptions, TMessageIds, TRuleListener>(
      create,
      detectionOptions
    ),
  });
}
