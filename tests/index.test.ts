import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { it, expect } from 'vitest';

import plugin from '../src';

const ruleNames = Object.keys(plugin.rules);

it('should export all existing rules', () => {
	const rulesDirPath = resolve(__dirname, '../src/rules');

	const rulesFiles = readdirSync(rulesDirPath)
		.filter((file) => file !== 'index.ts')
		.map((file) => file.replace('.ts', ''));

	rulesFiles.forEach((ruleFile) => {
		expect(ruleNames).toContain(ruleFile);
	});
});

it('should have a corresponding doc for each rule', () => {
	ruleNames.forEach((rule) => {
		const docPath = resolve(__dirname, '../docs/rules', `${rule}.md`);

		expect(
			existsSync(docPath),
			`Could not find documentation file for rule "${rule}" in path "${docPath}"`
		).toBe(true);
	});
});

it('should have a corresponding test for each rule', () => {
	ruleNames.forEach((rule) => {
		const testPath = resolve(__dirname, './rules/', `${rule}.test.ts`);

		expect(
			existsSync(testPath),
			`Could not find test file for rule "${rule}" in path "${testPath}"`
		).toBe(true);
	});
});

it('should export configs that refer to actual rules', () => {
	const allConfigs = plugin.configs;

	expect(Object.keys(allConfigs)).toEqual([
		'flat/dom',
		'flat/angular',
		'flat/react',
		'flat/vue',
		'flat/svelte',
		'flat/marko',
		'dom',
		'angular',
		'react',
		'vue',
		'svelte',
		'marko',
	]);

	const allConfigRules = Object.values(allConfigs)
		.map((config) => Object.keys(config.rules ?? {}))
		.reduce((previousValue, currentValue) => [
			...previousValue,
			...currentValue,
		]);

	allConfigRules.forEach((configRuleName) => {
		const ruleName = configRuleName.replace('testing-library/', '');

		expect(configRuleName).toMatch(/^testing-library\/[a-z-]+$/);
		expect(ruleNames).toContain(ruleName);

		const ruleFilePath = resolve(__dirname, '../src/rules', `${ruleName}.ts`);

		expect(() => import(ruleFilePath)).not.toThrow();
	});
});
