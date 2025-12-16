import path from 'node:path';

async function buildEslintCommand(filenames) {
	const filenamesFlag = filenames
		.map((filename) => path.relative(process.cwd(), filename))
		.join(' ');

	return `eslint --fix ${filenamesFlag}`;
}

const config = {
	'*.{js,ts,mjs,mts}': [buildEslintCommand],
	'*': 'prettier --write --ignore-unknown',
};

export default config;
