// @ts-check

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import eslintPluginPlugin from 'eslint-plugin-eslint-plugin';
import { importX } from 'eslint-plugin-import-x';
import jest from 'eslint-plugin-jest';
import * as jestFormatting from 'eslint-plugin-jest-formatting';
import nodePlugin from 'eslint-plugin-n';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = defineConfig(
	js.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	nodePlugin.configs['flat/recommended-module'],
	eslintPluginPlugin.configs.recommended,
	{
		name: 'Language options',
		files: ['**/*.{js,mjs,cjs,ts,mts}'],
		languageOptions: {
			globals: {
				...globals.node,
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
	},
	{
		name: 'Overrides for all files',
		rules: {
			// Base
			'max-lines-per-function': 'off',
			'no-console': 'warn',

			// TypeScript
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-use-before-define': 'off',

			// Import
			'import-x/order': [
				'warn',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						['parent', 'sibling', 'index'],
						'object',
						'type',
					],
					'newlines-between': 'always',

					alphabetize: {
						order: 'asc',
						caseInsensitive: false,
					},
				},
			],
			'import-x/first': 'error',
			'import-x/no-empty-named-blocks': 'error',
			'import-x/no-extraneous-dependencies': 'error',
			'import-x/no-mutable-exports': 'error',
			'import-x/no-named-default': 'error',
			'import-x/no-relative-packages': 'warn',

			// Node
			'n/no-missing-import': 'off', // handled by import-x and TS
			'n/no-missing-require': 'off', // handled by import-x and TS
		},
	},
	{
		name: 'Rule overrides only for TypeScript files',
		files: ['**/*.{ts,mts}'],
		rules: {
			// Rules enabled by `import-x/recommended` but are better handled by
			// TypeScript and typescript-eslint.
			'import-x/default': 'off',
			'import-x/export': 'off',
			'import-x/namespace': 'off',
			'import-x/no-unresolved': 'off',
		},
	},
	{
		name: 'Jest config',
		files: ['**/*.test.ts', '**/*.test.js'],
		...jest.configs['flat/recommended'],
		...jestFormatting.configs['flat/recommended'],
	},
	{
		name: 'Plain JS',
		files: ['**/*.{js,mjs,cjs}'],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		name: 'Config files',
		files: ['**/*rc*.{js,mjs,cjs}', '**/*.config.{js,cjs,mjs,ts}'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'import-x/no-named-as-default-member': 'off',
		},
	},
	globalIgnores(['**/coverage/', '**/dist/']),
	prettierConfig // must always be the last one
);

export default config;
