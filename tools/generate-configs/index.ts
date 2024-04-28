import { type LinterConfigRules } from '../../lib/configs';
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
		.filter(
			([
				_,
				{
					meta: { docs },
				},
			]) => Boolean(docs.recommendedConfig[framework])
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
		// "plugins" property must be assigned after defining the plugin variable in the "lib/index.ts"
		// https://eslint.org/docs/latest/extend/plugin-migration-flat-config#migrating-configs-for-flat-config
		rules: getRecommendedRulesForTestingFramework(framework),
	};

	writeConfig(specificFrameworkConfig, framework);
});
