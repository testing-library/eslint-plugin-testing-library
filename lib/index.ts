import packageMetadata from '../package.json';

import configs from './configs';
import rules from './rules';
import { type SupportedTestingFramework } from './utils';

// TODO: type properly when upgraded to ESLint v9
const plugin = {
	meta: {
		name: packageMetadata.name,
		version: packageMetadata.version,
	},
	configs,
	rules,
};

// TODO: type this with TSESLint.Linter.RuleEntry when upgraded to ESLint v9
Object.keys(plugin.configs).forEach((configKey) => {
	plugin.configs[configKey as SupportedTestingFramework].plugins = {
		// TODO: remove ignored error when properly typed with ESLint v9
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		'testing-library': plugin,
	};
});

export default plugin;
