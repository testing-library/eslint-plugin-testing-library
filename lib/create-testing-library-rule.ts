import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from './utils';
import {
  detectTestingLibraryUtils,
  DetectionHelpers,
} from './detect-testing-library-utils';

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
    create: (
      context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
      optionsWithDefault: Readonly<TOptions>,
      detectionHelpers: Readonly<DetectionHelpers>
    ) => TRuleListener;
  }>
): TSESLint.RuleModule<TMessageIds, TOptions, TRuleListener> {
  const { create, ...remainingConfig } = config;

  return ESLintUtils.RuleCreator(getDocsUrl)({
    ...remainingConfig,
    create: detectTestingLibraryUtils<TOptions, TMessageIds, TRuleListener>(
      create
    ),
  });
}
