// @ts-check

import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
	recommendedConfig: js.configs.recommended,
});

const config = defineConfig(
	{
		languageOptions: {
			globals: {
				...globals.es2019,
			},
		},

		extends: fixupConfigRules(
			compat.extends(
				'eslint:recommended',
				'plugin:import/recommended',
				'plugin:jest/recommended',
				'plugin:jest-formatting/recommended',
				'prettier'
			)
		),

		rules: {
			'max-lines-per-function': 'off',

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
	},
	{
		files: ['**/*.ts'],

		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},

		extends: fixupConfigRules(
			compat.extends(
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-type-checked',
				'plugin:import/typescript'
			)
		),

		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',

			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
				},
			],

			'@typescript-eslint/no-use-before-define': 'off',
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
	globalIgnores(['**/coverage/', '**/dist/'])
);

export default config;
