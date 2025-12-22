import { baseConfigs } from './configs';
import { rules } from './rules';
import {
	name as packageName,
	version as packageVersion,
} from '../package.json';

import type { SupportedTestingFramework } from './utils';
import type { ESLint, Rule, Linter } from 'eslint';

type ClassicConfigs = Record<SupportedTestingFramework, Linter.LegacyConfig>;
type FlatConfigs = Record<`flat/${SupportedTestingFramework}`, Linter.Config>;
type PluginConfigs = ClassicConfigs & FlatConfigs;

type TestingLibraryPlugin = Omit<ESLint.Plugin, 'rules' | 'configs'> & {
	rules: NonNullable<ESLint.Plugin['rules']>;
	configs: PluginConfigs;
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

const testingLibraryPlugin: TestingLibraryPlugin = {
	meta: {
		name: packageName,
		version: packageVersion,
	},
	rules: rules as unknown as Record<string, Rule.RuleModule>,
	configs: {
		...createPluginFlatConfigs(),
		...createPluginLegacyConfigs(),
	},
};

export default testingLibraryPlugin;
