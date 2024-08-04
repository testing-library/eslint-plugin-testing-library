import {
	name as packageName,
	version as packageVersion,
} from '../package.json';

import configs from './configs';
import rules from './rules';

export = {
	meta: {
		name: packageName,
		version: packageVersion,
	},
	configs,
	rules,
};
