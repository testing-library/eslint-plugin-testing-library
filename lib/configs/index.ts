import angular from './angular';
import dom from './dom';
import marko from './marko';
import react from './react';
import svelte from './svelte';
import vue from './vue';

import type { SupportedTestingFramework } from '../utils';
import type { Linter } from 'eslint';

const legacyConfigs: Record<SupportedTestingFramework, Linter.LegacyConfig> = {
	dom,
	angular,
	react,
	vue,
	svelte,
	marko,
};

export { legacyConfigs };
