import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { baseConfigs } from './configs';
import { rules } from './rules';

import type { SupportedTestingFramework } from './utils';
import type { ESLint, Rule, Linter } from 'eslint';

type ClassicConfigs = Record<SupportedTestingFramework, Linter.LegacyConfig>;
type FlatConfigs = Record<`flat/${SupportedTestingFramework}`, Linter.Config>;
type PluginConfigs = ClassicConfigs & FlatConfigs;

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Reference package.json with `require` so it takes the right "version"
// with semantic release after bundle is generated.
const { name: packageName, version: packageVersion } = require(
	resolve(__dirname, '../package.json')
) as {
	name: string;
	version: string;
};

const PLUGIN_NAME = 'testing-library' as const;

function createPluginFlatConfigs() {
	return Object.entries(baseConfigs).reduce(
		(acc, [configName, configRecord]) => {
			const flatName = `flat/${configName}`;

			return {
				...acc,
				[flatName]: {
					name: `${PLUGIN_NAME}/${configName}`,
					plugins: {
						get 'testing-library'(): ESLint.Plugin {
							return testingLibraryPlugin;
						},
					},
					rules: configRecord.rules,
				},
			};
		},
		{}
	) as {
		[TKey in SupportedTestingFramework as `flat/${SupportedTestingFramework}`]: Linter.Config;
	};
}

function createPluginLegacyConfigs() {
	return Object.entries(baseConfigs).reduce(
		(acc, [configName, configRecord]) => {
			return {
				...acc,
				[configName]: {
					plugins: [PLUGIN_NAME],
					rules: configRecord.rules,
				},
			};
		},
		{}
	) as {
		[TLegacyKey in SupportedTestingFramework]: Linter.LegacyConfig;
	};
}

const testingLibraryPlugin = {
	meta: {
		name: packageName,
		version: packageVersion,
	},
	rules: rules as unknown as Record<string, Rule.RuleModule>,
	configs: {
		...createPluginFlatConfigs(),
		...createPluginLegacyConfigs(),
	} satisfies PluginConfigs,
} as const satisfies ESLint.Plugin;

export default testingLibraryPlugin;
