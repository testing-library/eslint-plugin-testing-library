import angular from './angular';
import dom from './dom';
import marko from './marko';
import react from './react';
import shadowDom from './shadow-dom';
import svelte from './svelte';
import vue from './vue';

import type { SupportedTestingFramework } from '../utils';
import type { Linter } from 'eslint';

type BaseConfig = {
	rules: Linter.RulesRecord;
};

export const baseConfigs = {
	dom,
	angular,
	react,
	vue,
	svelte,
	marko,
	'shadow-dom': shadowDom,
} as const satisfies {
	[TKey in SupportedTestingFramework]: BaseConfig;
};
