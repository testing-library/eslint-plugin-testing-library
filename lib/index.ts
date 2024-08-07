import configs from './configs';
import rules from './rules';

// we can't natively import package.json as tsc will copy it into dist/
const {
	name: packageName,
	version: packageVersion,
	// eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('../package.json') as { name: string; version: string };

export = {
	meta: {
		name: packageName,
		version: packageVersion,
	},
	configs,
	rules,
};
