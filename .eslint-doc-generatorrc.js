import * as prettier from 'prettier';

/** @type {import('eslint-doc-generator').GenerateOptions} */
export default {
	configEmoji: [
		['angular', '![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black)'],
		['dom', '![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square)'],
		['marko', '![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black)'],
		['react', '![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black)'],
		['svelte', '![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black)'],
		['vue', '![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black)'],
	],
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
