import { writeConfig } from './utils';
import { rules } from '../../src/rules';
import { SUPPORTED_TESTING_FRAMEWORKS } from '../../src/utils';

import type { SupportedTestingFramework } from '../../src/utils';

const RULE_NAME_PREFIX = 'testing-library/';

const getRecommendedRulesForTestingFramework = (
	framework: SupportedTestingFramework
) =>
	Object.entries(rules)
		.filter(([_, { meta }]) => Boolean(meta.docs.recommendedConfig[framework]))
		.reduce((allRules, [ruleName, { meta }]) => {
			const name = `${RULE_NAME_PREFIX}${ruleName}`;
			const recommendation = meta.docs.recommendedConfig[framework];

			return {
				...allRules,
				[name]: recommendation,
			};
		}, {});

(async () => {
	for (const framework of SUPPORTED_TESTING_FRAMEWORKS) {
		const specificFrameworkConfig = {
			rules: getRecommendedRulesForTestingFramework(framework),
		};

		await writeConfig(specificFrameworkConfig, framework);
	}
})().catch((error) => {
	// eslint-disable-next-line no-console
	console.error(error);
	process.exitCode = 1;
});
