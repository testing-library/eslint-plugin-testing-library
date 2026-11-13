import { Linter, type ESLint } from 'eslint';
import {
	parser as typescriptParser,
	plugin as typescriptPlugin,
} from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import awaitAsyncEvents from '../../src/rules/await-async-events';

const testingLibraryPlugin = {
	rules: {
		'await-async-events': awaitAsyncEvents,
	},
} as unknown as ESLint.Plugin;

const config: Linter.Config = {
	files: ['**/*.ts'],
	languageOptions: {
		parser: typescriptParser,
		parserOptions: {
			projectService: true,
			tsconfigRootDir: process.cwd(),
		},
	},
	plugins: {
		'@typescript-eslint': typescriptPlugin,
		'testing-library': testingLibraryPlugin,
	},
	rules: {
		'@typescript-eslint/require-await': 'error',
		'testing-library/await-async-events': [
			'error',
			{ eventModule: 'userEvent' },
		],
	},
};

function lint(code: string) {
	const linter = new Linter();
	return linter.verify(code, [config], {
		filename: `${process.cwd()}/tests/rules/await-async-events.integration.test.ts`,
	});
}

describe('await-async-events integration', () => {
	it('does not mutate the AST seen by other rules', () => {
		const messages = lint(`
			import userEvent from '@testing-library/user-event';

			declare const button: HTMLElement;
			declare function test(name: string, fn: () => void): void;

			test('clicks', () => {
				userEvent.click(button);
			});
		`);

		expect(messages).toHaveLength(1);
		expect(messages[0]).toMatchObject({
			ruleId: 'testing-library/await-async-events',
			messageId: 'awaitAsyncEvent',
		});
	}, 20_000);

	it('does not mutate the AST for functions wrapping an async event', () => {
		const messages = lint(`
			import userEvent from '@testing-library/user-event';

			declare const button: HTMLElement;
			declare function test(name: string, fn: () => void): void;

			function clickButton() {
				return userEvent.click(button);
			}

			test('clicks', () => {
				clickButton();
			});
		`);

		expect(messages).toHaveLength(1);
		expect(messages[0]).toMatchObject({
			ruleId: 'testing-library/await-async-events',
			messageId: 'awaitAsyncEventWrapper',
		});
	});
});
