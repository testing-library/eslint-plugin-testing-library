module.exports = {
	root: true,
	extends: [
		'kentcdodds',
		'plugin:jest/recommended',
		'plugin:jest-formatting/recommended',
		'prettier',
	],
	rules: {
		// Base
		'max-lines-per-function': 'off',
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: ['@typescript-eslint/utils/dist/*'],
						message: 'Import from `@typescript-eslint/utils` instead.',
					},
				],
			},
		],

		// Import
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
				tsconfigRootDir: __dirname,
				project: ['./tsconfig.eslint.json'],
			},
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
			],
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
