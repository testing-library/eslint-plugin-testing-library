// @ts-check

import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import jest from 'eslint-plugin-jest';
import * as jestFormatting from 'eslint-plugin-jest-formatting';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
});

const config = defineConfig(
	js.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	{
		name: 'Language options',
		languageOptions: {
			globals: {
				...globals.node,
			},
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		// TODO: replace import with import-x
		name: 'Import plugin config',
		extends: fixupConfigRules(compat.extends('plugin:import/recommended')),

		rules: {
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
		name: 'Rules overrides for all files',
		rules: {
			// Base
			'max-lines-per-function': 'off',

			// TypeScript
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-use-before-define': 'off',
		},
	},
	{
		name: 'Rule overrides for TypeScript files',
		files: ['**/*.ts', '**/*.mts'],
		rules: {
			// Import
			// Rules enabled by `import/recommended` but are better handled by
			// TypeScript and @typescript-eslint.
			'import/default': 'off',
			'import/export': 'off',
			'import/namespace': 'off',
			'import/no-unresolved': 'off',
		},
	},
	// {
	// 	files: ['**/*.ts'],
	//
	// 	extends: fixupConfigRules(
	// 		compat.extends(
	// 			'plugin:import/typescript'
	// 		)
	// 	),
	//
	// 	rules: {
	// 		'import/default': 'off',
	// 		'import/export': 'off',
	// 		'import/namespace': 'off',
	// 		'import/no-unresolved': 'off',
	// 	},
	//
	// 	settings: {
	// 		'import/resolver': {
	// 			node: {
	// 				extensions: ['.js', '.ts'],
	// 			},
	//
	// 			typescript: {
	// 				alwaysTryTypes: true,
	// 			},
	// 		},
	// 	},
	// },
	{
		name: 'Jest config',
		files: ['**/*.test.ts', '**/*.test.js'],
		...jest.configs['flat/recommended'],
		...jestFormatting.configs['flat/recommended'],
	},
	{
		name: 'Plain JS',
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		name: 'Config files',
		files: ['./*.js', './*.cjs', './*.mjs', '**/*.config.*js'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'import/no-unresolved': 'off',
		},
	},
	globalIgnores(['**/coverage/', '**/dist/']),
	prettierConfig // must always be the last one
);

export default config;
