import { InvalidTestCase } from '@typescript-eslint/rule-tester';

import { createTestingLibraryRule } from '../../../lib/create-testing-library-rule';
import { LIBRARY_MODULES } from '../../../lib/utils';
import { resolveToTestingLibraryFn } from '../../../lib/utils/resolve-to-testing-library-fn';
import { createRuleTester } from '../test-utils';

type MessageIds = 'details';

const rule = createTestingLibraryRule<[], MessageIds>({
	name: __filename,
	meta: {
		docs: {
			recommendedConfig: {
				dom: 'error',
				angular: 'error',
				react: 'error',
				vue: 'error',
				svelte: 'error',
				marko: 'error',
			},
			description: 'Fake rule for testing parseUserEventFnCall',
		},
		messages: {
			details: '{{ data }}',
		},
		schema: [],
		type: 'problem',
	},
	defaultOptions: [],
	create: (context) => ({
		CallExpression(node) {
			const testingLibraryFn = resolveToTestingLibraryFn(node, context);

			if (testingLibraryFn) {
				context.report({
					messageId: 'details',
					node,
					data: {
						data: testingLibraryFn,
					},
				});
			}
		},
	}),
});

const ruleTester = createRuleTester();

ruleTester.run('esm', rule, {
	valid: [
		{
			code: `
			import { userEvent } from './test-utils';

			(userEvent => userEvent.setup)();
		`,
		},
		{
			code: `
			import { userEvent } from './test-utils';

			function userClick() {
				userEvent.click(document.body);
			}
    	[].forEach(userClick);
		`,
		},
		{
			code: `
			import { userEvent } from './test-utils';

			userEvent.setup()
		`,
		},
		...LIBRARY_MODULES.map((module) => ({
			code: `
      import * as testingLibrary from '${module}';

			const { fireEvent } = testingLibrary
			fireEvent.click(document.body)
		`,
		})),
	],
	invalid: [
		{
			code: `
			import userEvent from '@testing-library/user-event';

			userEvent.setup()
		`,
			errors: [
				{
					messageId: 'details',
					data: {
						data: {
							original: null,
							local: 'userEvent',
						},
					},
				},
			],
		},
		...LIBRARY_MODULES.flatMap<InvalidTestCase<MessageIds, []>>((module) => [
			{
				code: `
				import { fireEvent } from '${module}';

				fireEvent.click(document.body)
			`,
				errors: [
					{
						messageId: 'details',
						data: {
							data: {
								original: 'fireEvent',
								local: 'fireEvent',
							},
						},
					},
				],
			},
			{
				code: `
				import { fireEvent as fe } from '${module}';

				fe.click(document.body)
			`,
				errors: [
					{
						messageId: 'details',
						data: {
							data: {
								original: 'fireEvent',
								local: 'fe',
							},
						},
					},
				],
			},
		]),
	],
});

ruleTester.run('cjs', rule, {
	valid: [
		{
			code: `
			 const { userEvent } = require('./test-utils');

			userEvent.setup()
		`,
		},
		...LIBRARY_MODULES.map((module) => ({
			code: `
      const testingLibrary = require('${module}');

			const { fireEvent } = testingLibrary
			fireEvent.click(document.body)
		`,
		})),
	],
	invalid: [
		{
			code: `
			const { default: userEvent } = require('@testing-library/user-event');

			userEvent.setup()
		`,
			errors: [
				{
					messageId: 'details',
					data: {
						data: {
							original: null,
							local: 'userEvent',
						},
					},
				},
			],
		},
		...LIBRARY_MODULES.flatMap<InvalidTestCase<MessageIds, []>>((module) => [
			{
				code: `
				const { fireEvent } = require('${module}');

				fireEvent.click(document.body)
			`,
				errors: [
					{
						messageId: 'details',
						data: {
							data: {
								original: 'fireEvent',
								local: 'fireEvent',
							},
						},
					},
				],
			},
			{
				code: `
			const { fireEvent: fe } = require('${module}');

			fe.click(document.body)
		`,
				errors: [
					{
						messageId: 'details',
						data: {
							data: {
								original: 'fireEvent',
								local: 'fe',
							},
						},
					},
				],
			},
		]),
	],
});

ruleTester.run('typescript', rule, {
	valid: [
		{
			code: `
        import userEvent = require('@testing-library/user-event');

        userEvent.setup()
      `,
		},
	],
	invalid: [],
});
