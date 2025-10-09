// @ts-check

import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = defineConfig(
	js.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
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
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		name: 'Rules overrides for all files',
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
		name: 'Vitest config',
		files: ['**/*.test.ts', '**/*.test.js'],
		...vitest.configs.recommended,
		rules: {
			...vitest.configs.recommended.rules,
			'vitest/padding-around-all': 'warn',
		},
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
