import rule, { RULE_NAME } from '../../../lib/rules/consistent-data-testid';
import { createRuleTester } from '../test-utils';

import type {
	MessageIds,
	Options,
} from '../../../lib/rules/consistent-data-testid';
import type {
	InvalidTestCase,
	ValidTestCase,
} from '@typescript-eslint/rule-tester';

const ruleTester = createRuleTester();

type RuleValidTestCase = ValidTestCase<Options>;
type RuleInvalidTestCase = InvalidTestCase<MessageIds, Options>;
type TestCase = RuleValidTestCase | RuleInvalidTestCase;
const disableAggressiveReporting = <T extends TestCase>(array: T[]): T[] =>
	array.map((testCase) => ({
		...testCase,
		settings: {
			'testing-library/utils-module': 'off',
			'testing-library/custom-renders': 'off',
			'testing-library/custom-queries': 'off',
		},
	}));

const validTestCases: RuleValidTestCase[] = [
	{
		code: `
          import React from 'react';

          const TestComponent = props => {
            return (
              <div data-testid="cool">
                Hello
              </div>
            )
          };
        `,
		options: [{ testIdPattern: 'cool' }],
	},
	{
		code: `
          import React from 'react';

          const TestComponent = props => {
            return (
              <div className="cool">
                Hello
              </div>
            )
          };
        `,
		options: [{ testIdPattern: 'cool' }],
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="Awesome__CoolStuff">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
			},
		],
		filename: '/my/cool/file/path/Awesome.js',
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="Awesome">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
			},
		],
		filename: '/my/cool/file/path/Awesome.js',
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="Parent">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
			},
		],
		filename: '/my/cool/file/Parent/index.js',
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="Parent">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '{fileName}',
			},
		],
		filename: '/my/cool/__tests__/Parent/index.js',
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="wrong" custom-attr="right-1">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^right(.*)$',
				testIdAttribute: 'custom-attr',
			},
		],
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div another-custom-attr="right-1" custom-attr="right-2">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^right(.*)$',
				testIdAttribute: ['custom-attr', 'another-custom-attr'],
			},
		],
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-test-id="Parent">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '{fileName}',
				testIdAttribute: 'data-test-id',
			},
		],
		filename: '/my/cool/__tests__/Parent/index.js',
	},
	{
		code: `
          import React from 'react';

          const TestComponent = props => {
            const dynamicTestId = 'somethingDynamic';
            return (
              <div data-testid={\`cool-\${dynamicTestId}\`}>
                Hello
              </div>
            )
          };
        `,
		options: [{ testIdPattern: 'somethingElse' }],
	},
	// To fix issue 509, https://github.com/testing-library/eslint-plugin-testing-library/issues/509
	// Gatsby.js ja Next.js use square brackets in filenames to create dynamic routes
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="__CoolStuff">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
			},
		],
		filename: '/my/cool/file/path/[client-only].js',
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="__CoolStuff">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				// should work if given the {fileName} placeholder
				testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
			},
		],
		filename: '/my/cool/file/path/[...wildcard].js',
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="__CoolStuff">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				// should work also if not given the {fileName} placeholder
				testIdPattern: '^(__([A-Z]+[a-z]*?)+)*$',
			},
		],
		filename: '/my/cool/file/path/[...wildcard].js',
	},
];
const invalidTestCases: RuleInvalidTestCase[] = [
	{
		code: `
        import React from 'react';

        const TestComponent = props => {
          return (
            <div data-testid="Awesome__CoolStuff">
              Hello
            </div>
          )
        };
        `,
		options: [{ testIdPattern: 'error' }],
		errors: [
			{
				messageId: 'consistentDataTestId',
				data: {
					attr: 'data-testid',
					value: 'Awesome__CoolStuff',
					regex: '/error/',
					message: '',
				},
			},
		],
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="Nope">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: 'matchMe',
			},
		],
		filename: '/my/cool/__tests__/Parent/index.js',
		errors: [
			{
				messageId: 'consistentDataTestId',
				data: {
					attr: 'data-testid',
					value: 'Nope',
					regex: '/matchMe/',
					message: '',
				},
			},
		],
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="Parent__cool" my-custom-attr="WrongComponent__cool">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
				testIdAttribute: 'my-custom-attr',
			},
		],
		filename: '/my/cool/__tests__/Parent/index.js',
		errors: [
			{
				messageId: 'consistentDataTestId',
				data: {
					attr: 'my-custom-attr',
					value: 'WrongComponent__cool',
					regex: '/^Parent(__([A-Z]+[a-z]*?)+)*$/',
					message: '',
				},
			},
		],
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div custom-attr="wrong" another-custom-attr="wrong">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^right$',
				testIdAttribute: ['custom-attr', 'another-custom-attr'],
			},
		],
		filename: '/my/cool/__tests__/Parent/index.js',
		errors: [
			{
				messageId: 'consistentDataTestId',
				data: {
					attr: 'custom-attr',
					value: 'wrong',
					regex: '/^right$/',
				},
			},
			{
				messageId: 'consistentDataTestId',
				data: {
					attr: 'another-custom-attr',
					value: 'wrong',
					regex: '/^right$/',
					message: '',
				},
			},
		],
	},
	{
		code: `
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="WrongComponent__cool">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^{fileName}(__([A-Z]+[a-z]*?)+)*$',
			},
		],
		filename: '/my/cool/__tests__/Parent/index.js',
		errors: [
			{
				messageId: 'consistentDataTestId',
				data: {
					attr: 'data-testid',
					value: 'WrongComponent__cool',
					regex: '/^Parent(__([A-Z]+[a-z]*?)+)*$/',
					message: '',
				},
			},
		],
	},
	{
		code: ` // test for custom message
            import React from 'react';

            const TestComponent = props => {
              return (
                <div data-testid="snake_case_value">
                  Hello
                </div>
              )
            };
          `,
		options: [
			{
				testIdPattern: '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$', //kebab-case
				customMessage: 'Please use kebab-cased data-testid values.',
			},
		],
		filename: '/my/cool/__tests__/Parent/index.js',
		errors: [
			{
				messageId: 'consistentDataTestIdCustomMessage',
				data: {
					attr: 'data-testid',
					value: 'snake_case_value',
					regex: '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
					message: 'Please use kebab-cased data-testid values.',
				},
			},
		],
	},
];

ruleTester.run(RULE_NAME, rule, {
	valid: [...validTestCases, ...disableAggressiveReporting(validTestCases)],
	invalid: [
		...invalidTestCases,
		...disableAggressiveReporting(invalidTestCases),
	],
});
