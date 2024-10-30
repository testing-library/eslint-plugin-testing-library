import { join } from 'path';

import type { TSESLint } from '@typescript-eslint/utils';

import {
	importDefault,
	SUPPORTED_TESTING_FRAMEWORKS,
	SupportedTestingFramework,
} from '../utils';

const configsDir = __dirname;

const getConfigForFramework = (framework: SupportedTestingFramework) =>
	importDefault<TSESLint.SharedConfig.RulesRecord>(join(configsDir, framework));

export default SUPPORTED_TESTING_FRAMEWORKS.reduce(
	(allConfigs, framework) => ({
		...allConfigs,
		[framework]: getConfigForFramework(framework),
	}),
	{}
) as Record<SupportedTestingFramework, TSESLint.SharedConfig.RulesRecord>;
