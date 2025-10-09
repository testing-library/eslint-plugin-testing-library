import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { it, expect } from 'vitest';

import plugin from '../lib';

const numberOfRules = 28;
const ruleNames = Object.keys(plugin.rules);

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

it('should have the correct amount of rules', () => {
	const { length } = ruleNames;

	expect(
		numberOfRules,
		`There should be exactly ${numberOfRules} rules, but there are ${length}. If you've added a new rule, please update this number.`
	).toEqual(length);
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

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-require-imports
		expect(() => require(`../lib/rules/${ruleName}`)).not.toThrow();
	});
});
