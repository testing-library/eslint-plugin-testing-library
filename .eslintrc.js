module.exports = {
	root: true,
	extends: [
		'kentcdodds',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:jest/recommended',
		'plugin:jest-formatting/recommended',
	],
	rules: {
		// Base
		'max-lines-per-function': 'off',
		'no-restricted-imports': [
			'error',
			{
				patterns: ['@typescript-eslint/utils/dist/*'],
			},
		],

		// Import
		'import/no-import-module-exports': 'off',
		'import/order': [
			'warn',
			{
				groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
					caseInsensitive: false,
				},
			},
		],
	},
	overrides: [
		{
			// TypeScript
			files: ['**/*.ts?(x)'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: './tsconfig.eslint.json',
			},
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/no-unused-vars': [
					'warn',
					{ argsIgnorePattern: '^_' },
				],
				'@typescript-eslint/no-use-before-define': 'off',
			},
		},
	],
};
