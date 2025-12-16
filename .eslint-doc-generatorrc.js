import * as prettier from 'prettier';

/** @type {import('eslint-doc-generator').GenerateOptions} */
export default {
	ignoreConfig: [
		'flat/angular',
		'flat/dom',
		'flat/marko',
		'flat/react',
		'flat/svelte',
		'flat/vue',
	],
	postprocess: async (content, path) => {
		const prettierConfig = await prettier.resolveConfig(path);
		return prettier.format(content, { ...prettierConfig, parser: 'markdown' });
	},
};
