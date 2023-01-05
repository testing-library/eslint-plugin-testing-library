const prettier = require('prettier');
const prettierConfig = require('./.prettierrc.js');

/** @type {import('eslint-doc-generator').GenerateOptions} */
const config = {
	postprocess: (content) =>
		prettier.format(content, { ...prettierConfig, parser: 'markdown' }),
};

module.exports = config;
