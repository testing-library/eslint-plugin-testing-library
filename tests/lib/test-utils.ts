import { resolve } from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';

export const createRuleTester = (
  parserOptions: Partial<TSESLint.ParserOptions> = {}
): TSESLint.RuleTester =>
  new TSESLint.RuleTester({
    parser: resolve('./node_modules/@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      // TODO: we should deep merge here
      ecmaFeatures: {
        jsx: true,
      },
      ...parserOptions,
    },
  });
