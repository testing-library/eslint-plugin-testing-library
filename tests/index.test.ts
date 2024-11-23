import { existsSync } from 'fs';
import { resolve } from 'path';

import plugin from '../lib';

const numberOfRules = 27;
const ruleNames = Object.keys(plugin.rules);

// eslint-disable-next-line jest/expect-expect
it('should have a corresponding doc for each rule', () => {
	ruleNames.forEach((rule) => {
		const docPath = resolve(__dirname, '../docs/rules', `${rule}.md`);

		if (!existsSync(docPath)) {
			throw new Error(
				`Could not find documentation file for rule "${rule}" in path "${docPath}"`
			);
		}
	});
});

// eslint-disable-next-line jest/expect-expect
it('should have a corresponding test for each rule', () => {
	ruleNames.forEach((rule) => {
		const testPath = resolve(__dirname, './lib/rules/', `${rule}.test.ts`);

		if (!existsSync(testPath)) {
			throw new Error(
				`Could not find test file for rule "${rule}" in path "${testPath}"`
			);
		}
	});
});

// eslint-disable-next-line jest/expect-expect
it('should have the correct amount of rules', () => {
	const { length } = ruleNames;

	if (length !== numberOfRules) {
		throw new Error(
			`There should be exactly ${numberOfRules} rules, but there are ${length}. If you've added a new rule, please update this number.`
		);
	}
});

it('should export configs that refer to actual rules', () => {
	const allConfigs = plugin.configs;

	expect(Object.keys(allConfigs)).toEqual([
		'dom',
		'angular',
		'react',
		'vue',
		'marko',
		'flat/dom',
		'flat/angular',
		'flat/react',
		'flat/vue',
		'flat/marko',
	]);
	const allConfigRules = Object.values(allConfigs)
		.map((config) => Object.keys(config.rules))
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
