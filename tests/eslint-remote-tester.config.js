/* eslint-disable  @typescript-eslint/no-require-imports  */
/* eslint-disable import/no-extraneous-dependencies */
const { rules } = require('eslint-plugin-testing-library');
const {
	getRepositories,
	getPathIgnorePattern,
} = require('eslint-remote-tester-repositories');

module.exports = {
	repositories: getRepositories({ randomize: true }),
	pathIgnorePattern: getPathIgnorePattern(),
	extensions: ['js', 'jsx', 'ts', 'tsx'],
	concurrentTasks: 3,
	cache: false,
	logLevel: 'info',
	eslintrc: {
		root: true,
		env: {
			es6: true,
		},
		parser: '@typescript-eslint/parser',
		parserOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			ecmaFeatures: {
				jsx: true,
			},
		},
		plugins: ['testing-library'],
		rules: {
			...Object.keys(rules).reduce(
				(all, rule) => ({
					...all,
					[`testing-library/${rule}`]: 'error',
				}),
				{}
			),

			// Rules with required options without default values
			'testing-library/consistent-data-testid': [
				'error',
				{ testIdPattern: '^{fileName}(__([A-Z]+[a-z]_?)+)_$' },
			],
		},
	},
};
