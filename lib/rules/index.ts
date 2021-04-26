import { readdirSync } from 'fs';
import { join, parse } from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';

import { importDefault } from '../utils';

type RuleModule = TSESLint.RuleModule<string, unknown[]>;

const rulesDir = __dirname;
const excludedFiles = ['index'];

export default readdirSync(rulesDir)
  .map((rule) => parse(rule).name)
  .filter((ruleName) => !excludedFiles.includes(ruleName))
  .reduce<Record<string, RuleModule>>(
    (allRules, ruleName) => ({
      ...allRules,
      [ruleName]: importDefault<RuleModule>(join(rulesDir, ruleName)),
    }),
    {}
  );
