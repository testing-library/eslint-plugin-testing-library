import type { TSESLint } from '@typescript-eslint/utils';

import configs from './configs';
import rules from './rules';
import { SupportedTestingFramework } from './utils';

// we can't natively import package.json as tsc will copy it into dist/
const {
	name: packageName,
	version: packageVersion,
	// eslint-disable-next-line @typescript-eslint/no-require-imports
} = require('../package.json') as { name: string; version: string };

const plugin = {
	meta: {
		name: packageName,
		version: packageVersion,
	},
	// ugly cast for now to keep TypeScript happy since
	// we don't have types for flat config yet
	configs: {} as Record<
		SupportedTestingFramework | `flat/${SupportedTestingFramework}`,
		TSESLint.SharedConfig.RulesRecord
	>,
	rules,
};

plugin.configs = {
	...configs,
	...(Object.fromEntries(
		Object.entries(configs).map(([framework, config]) => [
			`flat/${framework}`,
			{
				plugins: { 'testing-library': plugin },
				rules: config.rules,
			},
		])
	) as unknown as Record<
		`flat/${SupportedTestingFramework}`,
		TSESLint.SharedConfig.RulesRecord & { plugins: unknown }
	>),
};

export = plugin;
