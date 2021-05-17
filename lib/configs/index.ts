import { join } from 'path';

import {
  importDefault,
  SUPPORTED_TESTING_FRAMEWORKS,
  SupportedTestingFramework,
} from '../utils';

import type { TSESLint } from '@typescript-eslint/experimental-utils';

export type LinterConfigRules = Record<string, TSESLint.Linter.RuleEntry>;

const configsDir = __dirname;

const getConfigForFramework = (framework: SupportedTestingFramework) =>
  importDefault<LinterConfigRules>(join(configsDir, framework));

export default SUPPORTED_TESTING_FRAMEWORKS.reduce(
  (allConfigs, framework) => ({
    ...allConfigs,
    [framework]: getConfigForFramework(framework),
  }),
  {}
) as Record<SupportedTestingFramework, LinterConfigRules>;
