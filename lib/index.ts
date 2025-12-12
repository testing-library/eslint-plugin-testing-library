import { legacyConfigs } from './configs';
import rules from './rules';
import {
	name as packageName,
	version as packageVersion,
} from '../package.json';

import type { SupportedTestingFramework } from './utils';
import type { TSESLint } from '@typescript-eslint/utils';

type FinalConfigs = Record<
	SupportedTestingFramework | `flat/${SupportedTestingFramework}`,
	TSESLint.ClassicConfig.Config | TSESLint.FlatConfig.Config
>;

const plugin = {
	meta: {
		name: packageName,
		version: packageVersion,
	},
	configs: {} as FinalConfigs,
	rules,
};

plugin.configs = {
	...legacyConfigs,
	'flat/dom': {
		plugins: { 'testing-library': plugin },
		rules: legacyConfigs.dom.rules,
	},
	'flat/angular': {
		plugins: { 'testing-library': plugin },
		rules: legacyConfigs.angular.rules,
	},
	'flat/react': {
		plugins: { 'testing-library': plugin },
		rules: legacyConfigs.react.rules,
	},
	'flat/vue': {
		plugins: { 'testing-library': plugin },
		rules: legacyConfigs.vue.rules,
	},
	'flat/svelte': {
		plugins: { 'testing-library': plugin },
		rules: legacyConfigs.svelte.rules,
	},
	'flat/marko': {
		plugins: { 'testing-library': plugin },
		rules: legacyConfigs.marko.rules,
	},
} satisfies FinalConfigs;

export = plugin;
