import { join } from 'path';

import { importDefault, SUPPORTED_TESTING_FRAMEWORKS } from '../utils';

import type { SupportedTestingFramework } from '../utils';
import type { TSESLint } from '@typescript-eslint/utils';

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
