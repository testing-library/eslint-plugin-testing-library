import type { LinterConfigRules } from '../../lib/configs';
import rules from '../../lib/rules';
import {
  SUPPORTED_TESTING_FRAMEWORKS,
  SupportedTestingFramework,
} from '../../lib/utils';

import { LinterConfig, writeConfig } from './utils';

const RULE_NAME_PREFIX = 'testing-library/';

const getRecommendedRulesForTestingFramework = (
  framework: SupportedTestingFramework
): LinterConfigRules =>
  Object.entries(rules)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, { meta: { docs } }]) => Boolean(docs.recommended[framework]))
    .reduce(
      (allRules, [ruleName, { meta }]) => ({
        ...allRules,
        [ruleName.split(RULE_NAME_PREFIX)[0]]: meta.docs.recommended[framework],
      }),
      {}
    );

SUPPORTED_TESTING_FRAMEWORKS.forEach((framework) => {
  const specificFrameworkConfig: LinterConfig = {
    plugins: ['testing-library'],
    rules: getRecommendedRulesForTestingFramework(framework),
  };

  writeConfig(specificFrameworkConfig, framework);
});
