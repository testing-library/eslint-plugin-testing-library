import { readdirSync } from 'fs';
import { join, parse } from 'path';

import { TSESLint } from '@typescript-eslint/utils';

import { importDefault, TestingLibraryRuleMeta } from '../utils';

type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
	meta: TestingLibraryRuleMeta<string, unknown[]> & {
		recommended: false;
	};
};

const rulesDir = __dirname;
const excludedFiles = ['index'];

export default readdirSync(rulesDir)
	.map((rule) => parse(rule).name)
	.filter((ruleName) => !excludedFiles.includes(ruleName))
	.reduce<Record<string, RuleModule>>(
		(allRules, ruleName) => ({
			...allRules,
			[ruleName]: importDefault<RuleModule>(join(rulesDir, ruleName)),
		}),
		{}
	);
