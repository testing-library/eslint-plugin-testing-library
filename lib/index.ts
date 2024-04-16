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

export default plugin;
