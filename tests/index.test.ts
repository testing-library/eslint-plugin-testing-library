import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { it, expect } from 'vitest';

import plugin from '../lib';

const ruleNames = Object.keys(plugin.rules);

it('should export all existing rules', () => {
	const rulesDirPath = resolve(__dirname, '../lib/rules');

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
		const testPath = resolve(__dirname, './lib/rules/', `${rule}.test.ts`);

		expect(
			existsSync(testPath),
			`Could not find test file for rule "${rule}" in path "${testPath}"`
		).toBe(true);
	});
});

it('should export configs that refer to actual rules', () => {
	const allConfigs = plugin.configs;

	expect(Object.keys(allConfigs)).toEqual([
		'dom',
		'angular',
		'react',
		'vue',
		'svelte',
		'marko',
		'flat/dom',
		'flat/angular',
		'flat/react',
		'flat/vue',
		'flat/svelte',
		'flat/marko',
	]);

	const allConfigRules = Object.values(allConfigs)
		.map((config) => Object.keys(config.rules ?? {}))
		.reduce((previousValue, currentValue) => [
			...previousValue,
			...currentValue,
		]);

	allConfigRules.forEach((rule) => {
		const ruleNamePrefix = 'testing-library/';
		const ruleName = rule.slice(ruleNamePrefix.length);

		expect(rule.startsWith(ruleNamePrefix)).toBe(true);
		expect(ruleNames).toContain(ruleName);

		const ruleFilePath = resolve(__dirname, '../lib/rules', `${ruleName}.ts`);

		expect(() => import(ruleFilePath)).not.toThrow();
	});
});
