module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:import/recommended',
		'plugin:jest/recommended',
		'plugin:jest-formatting/recommended',
		'plugin:prettier/recommended',
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
		'import/first': 'error',
		'import/no-empty-named-blocks': 'error',
		'import/no-extraneous-dependencies': 'error',
		'import/no-mutable-exports': 'error',
		'import/no-named-default': 'error',
		'import/no-relative-packages': 'warn',
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
				'plugin:import/typescript',
			],
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/no-unused-vars': [
					'warn',
					{ argsIgnorePattern: '^_' },
				],
				'@typescript-eslint/no-use-before-define': 'off',

				// Import
				// Rules enabled by `import/recommended` but are better handled by
				// TypeScript and @typescript-eslint.
				'import/default': 'off',
				'import/export': 'off',
				'import/namespace': 'off',
				'import/no-unresolved': 'off',
			},
			settings: {
				'import/resolver': {
					node: {
						extensions: ['.js', '.ts'],
					},
					typescript: {
						alwaysTryTypes: true,
					},
				},
			},
		},
	],
};
