import packageMetadata from '../package.json';

import configs from './configs';
import rules from './rules';

const plugin = {
	meta: {
		name: packageMetadata.name,
		version: packageMetadata.version,
	},
	configs,
	rules,
};

// TODO: type this with TSESLint.Linter.RuleEntry when upgraded to ESLint v9
const pluginConfigs: Record<string, unknown> = {};
for (const [key, config] of Object.entries(configs)) {
	pluginConfigs[key] = {
		...config,
		plugins: { 'testing-library': plugin },
	};
}

export default plugin;
