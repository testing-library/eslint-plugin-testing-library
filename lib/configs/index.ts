import { join } from 'path';

import { type TSESLint } from '@typescript-eslint/utils';

import {
	importDefault,
	SUPPORTED_TESTING_FRAMEWORKS,
	SupportedTestingFramework,
} from '../utils';

export type LinterConfigRules = Pick<Required<TSESLint.Linter.Config>, 'rules'>;

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
