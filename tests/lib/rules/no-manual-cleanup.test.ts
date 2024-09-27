import rule, { RULE_NAME } from '../../../lib/rules/no-manual-cleanup';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const ALL_TESTING_LIBRARIES_WITH_CLEANUP = [
	'@testing-library/preact',
	'@testing-library/react',
	'@testing-library/svelte',
	'@testing-library/vue',
	'@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
	valid: [
		{
			code: `import "@testing-library/react"`,
		},
		{
			code: `import { cleanup } from "test-utils"`,
		},
		{
			// Angular Testing Library doesn't have `cleanup` util
			code: `import { cleanup } from "@testing-library/angular"`,
		},
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map((lib) => ({
			code: `import { render } from "${lib}"`,
		})),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map((lib) => ({
			code: `import utils from "${lib}"`,
		})),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map((lib) => ({
			code: `
        import utils from "${lib}"
        utils.render()
      `,
		})),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map((lib) => ({
			code: `const { render, within } = require("${lib}")`,
		})),
		{
			code: `const { cleanup } = require("any-other-library")`,
		},
		{
			code: `
        const utils = require("any-other-library")
        utils.cleanup()
      `,
		},
		{
			// For test coverage
			code: `const utils = render("something")`,
		},
		{
			code: `const utils = require(moduleName)`,
		},
	],
	invalid: [
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `import { render, cleanup } from "${lib}"`,
					errors: [
						{
							line: 1,
							column: 18, // error points to `cleanup`
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `
						import { render, cleanup } from "${lib}"
						import userEvent from "@testing-library/user-event"
					`,
					errors: [
						{
							line: 2,
							column: 24, // error points to `cleanup`
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `
						import userEvent from "@testing-library/user-event"
						import { render, cleanup } from "${lib}"
					`,
					errors: [
						{
							line: 3,
							column: 24, // error points to `cleanup`
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					// official testing-library packages should be reported with custom module setting
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `import { cleanup, render } from "${lib}"`,
					errors: [
						{
							line: 1,
							column: 10, // error points to `cleanup`
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { render, cleanup } from 'test-utils'
      `,
			errors: [{ line: 2, column: 26, messageId: 'noManualCleanup' }],
		},
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `import { cleanup as myCustomCleanup } from "${lib}"`,
					errors: [
						{
							line: 1,
							column: 10, // error points to `cleanup`
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { cleanup as myCustomCleanup } from 'test-utils'
      `,
			errors: [{ line: 2, column: 18, messageId: 'noManualCleanup' }],
		},
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `import utils, { cleanup } from "${lib}"`,
					errors: [
						{
							line: 1,
							column: 17, // error points to `cleanup`
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import utils, { cleanup } from 'test-utils'
      `,
			errors: [{ line: 2, column: 25, messageId: 'noManualCleanup' }],
		},
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `
        import utils from "${lib}"
        afterEach(() => utils.cleanup())
      `,
					errors: [
						{
							line: 3,
							column: 31,
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import utils from 'test-utils'
        afterEach(() => utils.cleanup())
      `,
			errors: [{ line: 3, column: 31, messageId: 'noManualCleanup' }],
		},
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `
        import utils from "${lib}"
        afterEach(utils.cleanup)
      `,
					errors: [
						{
							line: 3,
							column: 25,
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `const { cleanup } = require("${lib}")`,
					errors: [
						{
							line: 1,
							column: 9, // error points to `cleanup`
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        const { render, cleanup } = require('test-utils')
      `,
			errors: [{ line: 2, column: 25, messageId: 'noManualCleanup' }],
		},
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `
        const utils = require("${lib}")
        afterEach(() => utils.cleanup())
      `,
					errors: [
						{
							line: 3,
							column: 31,
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `
        const utils = require("${lib}")
        afterEach(utils.cleanup)
      `,
					errors: [
						{
							line: 3,
							column: 25,
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(
			(lib) =>
				({
					code: `
        import { render } from "${lib}";
        import { cleanup } from "${lib}";
        afterEach(cleanup);
      `,
					errors: [
						{
							line: 3,
							column: 18,
							messageId: 'noManualCleanup',
						},
					],
				}) as const
		),
		{
			code: `
				import { cleanup as cleanupVue } from "@testing-library/vue";
				import { cleanup as cleanupReact } from "@testing-library/react";
				afterEach(() => { cleanupVue(); cleanupReact(); });
			`,
			errors: [
				{
					line: 2,
					column: 14,
					messageId: 'noManualCleanup',
				},
				{
					line: 3,
					column: 14,
					messageId: 'noManualCleanup',
				},
			],
		},
	],
});
