import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils';

import { getDocsUrl, TestingLibraryRuleMeta } from '../utils';

import {
  DetectionOptions,
  detectTestingLibraryUtils,
  EnhancedRuleCreate,
} from './detect-testing-library-utils';

export function createTestingLibraryRule<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends TSESLint.RuleListener = TSESLint.RuleListener
>({
  create,
  detectionOptions = {},
  meta,
  ...remainingConfig
}: Readonly<{
  name: string;
  meta: TestingLibraryRuleMeta<TMessageIds>;
  defaultOptions: Readonly<TOptions>;
  detectionOptions?: Partial<DetectionOptions>;
  create: EnhancedRuleCreate<TOptions, TMessageIds, TRuleListener>;
}>): TSESLint.RuleModule<TMessageIds, TOptions> {
  return ESLintUtils.RuleCreator(getDocsUrl)({
    ...remainingConfig,
    create: detectTestingLibraryUtils<TOptions, TMessageIds, TRuleListener>(
      create,
      detectionOptions
    ),
    meta: {
      ...meta,
      docs: {
        ...meta.docs,
        recommended: false,
      },
    },
  });
}
