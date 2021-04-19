import { readdirSync } from 'fs';
import { join, parse } from 'path';

import { TSESLint } from '@typescript-eslint/experimental-utils';

type RuleModule = TSESLint.RuleModule<string, unknown[]>;

// Copied from https://github.com/babel/babel/blob/b35c78f08dd854b08575fc66ebca323fdbc59dab/packages/babel-helpers/src/helpers.js#L615-L619
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const interopRequireDefault = (obj: any): { default: unknown } =>
  obj?.__esModule ? obj : { default: obj };

const importDefault = (moduleName: string) =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  interopRequireDefault(require(moduleName)).default;

const rulesDir = __dirname;
const excludedFiles = ['index'];

export default readdirSync(rulesDir)
  .map((rule) => parse(rule).name)
  .filter((ruleName) => !excludedFiles.includes(ruleName))
  .reduce<Record<string, RuleModule>>(
    (allRules, ruleName) => ({
      ...allRules,
      [ruleName]: importDefault(join(rulesDir, ruleName)) as RuleModule,
    }),
    {}
  );
