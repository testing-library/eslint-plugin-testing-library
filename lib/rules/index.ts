import { readdirSync } from 'fs';
import { join, parse } from 'path';

import { importDefault, TestingLibraryPluginRuleModule } from '../utils';

const rulesDir = __dirname;
const excludedFiles = ['index'];

export default readdirSync(rulesDir)
	.map((rule) => parse(rule).name)
	.filter((ruleName) => !excludedFiles.includes(ruleName))
	.reduce<Record<string, TestingLibraryPluginRuleModule<string, unknown[]>>>(
		(allRules, ruleName) => ({
			...allRules,
			[ruleName]: importDefault<
				TestingLibraryPluginRuleModule<string, unknown[]>
			>(join(rulesDir, ruleName)),
		}),
		{}
	);
