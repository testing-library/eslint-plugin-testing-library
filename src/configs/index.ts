import angular from './angular';
import dom from './dom';
import marko from './marko';
import react from './react';
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
} as const satisfies {
	[TKey in SupportedTestingFramework]: BaseConfig;
};
