const prettier = require('prettier');
const prettierConfig = require('./.prettierrc.js');

/** @type {import('eslint-doc-generator').GenerateOptions} */
const config = {
	ignoreConfig: [
		'flat/angular',
		'flat/dom',
		'flat/marko',
		'flat/react',
		'flat/svelte',
		'flat/vue',
	],
	postprocess: (content) =>
		prettier.format(content, { ...prettierConfig, parser: 'markdown' }),
};

module.exports = config;
