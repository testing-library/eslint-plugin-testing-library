import rules from '../../lib/rules';
import {
  SUPPORTED_TESTING_FRAMEWORKS,
  SupportedTestingFramework,
} from '../../lib/utils';

import { LinterConfig, writeConfig } from './utils';

import type { LinterConfigRules } from '../../lib/configs';

const RULE_NAME_PREFIX = 'testing-library/';

const getRecommendedRulesForTestingFramework = (
  framework: SupportedTestingFramework
): LinterConfigRules =>
  Object.entries(rules)
    .filter(([_, { meta: { docs } }]) =>
      Boolean(docs.recommendedConfig[framework])
    )
    .reduce((allRules, [ruleName, { meta }]) => {
      const name = `${RULE_NAME_PREFIX}${ruleName}`;
      const recommendation = meta.docs.recommendedConfig[framework];

      return {
        ...allRules,
        [name]: recommendation,
      };
    }, {});

SUPPORTED_TESTING_FRAMEWORKS.forEach((framework) => {
  const specificFrameworkConfig: LinterConfig = {
    plugins: ['testing-library'],
    rules: getRecommendedRulesForTestingFramework(framework),
  };

  writeConfig(specificFrameworkConfig, framework);
});
