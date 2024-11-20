import type { TSESLint } from '@typescript-eslint/utils';

import { SupportedTestingFramework } from './lib/utils';

declare const plugin: {
	meta: {
		name: string;
		version: string;
	};
	configs: Record<SupportedTestingFramework, TSESLint.ClassicConfig> &
		Record<`flat/${SupportedTestingFramework}`, TSESLint.FlatConfig>;
	rules: Record<string, TSESLint.RuleModule>;
};

export = plugin;
