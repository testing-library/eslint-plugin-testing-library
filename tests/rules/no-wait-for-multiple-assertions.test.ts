import rule from '../../src/rules/no-wait-for-multiple-assertions';
import { createRuleTester } from '../test-utils';

import type { MessageIds } from '../../src/rules/no-wait-for-multiple-assertions';
import type {
	InvalidTestCase,
	ValidTestCase,
} from '@typescript-eslint/rule-tester';

type RuleValidTestCase = ValidTestCase<[]>;
type RuleInvalidTestCase = InvalidTestCase<MessageIds, []>;

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/dom',
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/vue',
	'@marko/testing-library',
];

ruleTester.run(rule.name, rule, {
	valid: [
		{
			code: `
        await waitFor(() => expect(a).toEqual('a'))
      `,
		},
		{
			code: `
        await waitFor(function() {
          expect(a).toEqual('a')
        })
      `,
		},
		{
			code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
		},
		{
			code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          expect('a').toEqual('a')
        })
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `// Aggressive Reporting disabled - module imported not matching
        import { waitFor } from 'somewhere-else'
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
		},
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleValidTestCase>(
			(testingFramework) => ({
				settings: { 'testing-library/utils-module': 'test-utils' },
				code: `// Aggressive Reporting disabled - waitFor renamed
        import { waitFor as renamedWaitFor } from '${testingFramework}'
        import { waitFor } from 'somewhere-else'
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
			})
		),
		// this needs to be check by other rule
		{
			code: `
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
		},
		{
			code: `
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
		},
		{
			code: `
        await waitFor(() => {
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
		},
		{
			code: `
        await waitFor(function() {
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
		},
		{
			code: `
        await waitFor(() => {})
      `,
		},
		{
			code: `
        await waitFor(function() {})
      `,
		},
		{
			code: `
        await waitFor(() => {
          // testing
        })
      `,
		},
	],
	invalid: [
		{
			code: `
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(a).toEqual('a')
        })
      `,
			errors: [
				{ line: 4, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(() => {
          expect(a).toEqual('a')
        })
        expect(a).toEqual('a')
      `,
		},
		{
			code: `
        await waitFor(() => {
          expect(screen.getByTestId('a')).toHaveTextContent('a')
          expect(screen.getByTestId('a')).toHaveTextContent('a')
        })
      `,
			errors: [
				{ line: 4, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(() => {
          expect(screen.getByTestId('a')).toHaveTextContent('a')
        })
        expect(screen.getByTestId('a')).toHaveTextContent('a')
      `,
		},
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleInvalidTestCase>(
			(testingFramework) => ({
				settings: { 'testing-library/utils-module': 'test-utils' },
				code: `// Aggressive Reporting disabled
        import { waitFor } from '${testingFramework}'
        await waitFor(() => {
          expect(a).toEqual('a')
          expect(a).toEqual('a')
        })
      `,
				errors: [
					{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
				],
				output: `// Aggressive Reporting disabled
        import { waitFor } from '${testingFramework}'
        await waitFor(() => {
          expect(a).toEqual('a')
        })
        expect(a).toEqual('a')
      `,
			})
		),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `// Aggressive Reporting disabled
        import { waitFor as renamedWaitFor } from 'test-utils'
        await renamedWaitFor(() => {
          expect(a).toEqual('a')
          expect(a).toEqual('a')
        })
      `,
			errors: [
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `// Aggressive Reporting disabled
        import { waitFor as renamedWaitFor } from 'test-utils'
        await renamedWaitFor(() => {
          expect(a).toEqual('a')
        })
        expect(a).toEqual('a')
      `,
		},
		{
			code: `
        await waitFor(() => {
          expect(a).toEqual('a')
          console.log('testing-library')
          expect(a).toEqual('a')
        })
      `,
			errors: [
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(() => {
          expect(a).toEqual('a')
          console.log('testing-library')
        })
        expect(a).toEqual('a')
      `,
		},
		{
			code: `
        test('should whatever', async () => {
          await waitFor(() => {
            expect(a).toEqual('a')
            console.log('testing-library')
            expect(a).toEqual('a')
          })
        })
      `,
			errors: [
				{ line: 6, column: 13, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        test('should whatever', async () => {
          await waitFor(() => {
            expect(a).toEqual('a')
            console.log('testing-library')
          })
          expect(a).toEqual('a')
        })
      `,
		},
		{
			code: `
        await waitFor(async () => {
          expect(a).toEqual('a')
          await somethingAsync()
          expect(a).toEqual('a')
        })
      `,
			errors: [
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(async () => {
          expect(a).toEqual('a')
          await somethingAsync()
        })
        expect(a).toEqual('a')
      `,
		},
		{
			code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(a).toEqual('a')
          expect(a).toEqual('a')
          expect(a).toEqual('a')
        })
      `,
			errors: [
				{ line: 4, column: 11, messageId: 'noWaitForMultipleAssertion' },
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
				{ line: 6, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: [
				`
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(a).toEqual('a')
          expect(a).toEqual('a')
        })
        expect(a).toEqual('a')
      `,
				`
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(a).toEqual('a')
        })
        expect(a).toEqual('a')
        expect(a).toEqual('a')
      `,
				`
        await waitFor(function() {
          expect(a).toEqual('a')
        })
        expect(a).toEqual('a')
        expect(a).toEqual('a')
        expect(a).toEqual('a')
      `,
			],
		},
		{
			code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(a).toEqual('a')
          expect(b).toEqual('b')
          expect(b).toEqual('b')
        })
      `,
			errors: [
				{ line: 4, column: 11, messageId: 'noWaitForMultipleAssertion' },
				{ line: 6, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: [
				`
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
          expect(b).toEqual('b')
        })
        expect(a).toEqual('a')
      `,
				`
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
        expect(b).toEqual('b')
        expect(a).toEqual('a')
      `,
			],
		},
		{
			code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          console.log('testing-library')
          expect(a).toEqual('a')
        })
      `,
			errors: [
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(function() {
          expect(a).toEqual('a')
          console.log('testing-library')
        })
        expect(a).toEqual('a')
      `,
		},
		{
			code: `
        await waitFor(async function() {
          expect(a).toEqual('a')
          const el = await somethingAsync()
          expect(a).toEqual('a')
        })
      `,
			errors: [
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(async function() {
          expect(a).toEqual('a')
          const el = await somethingAsync()
        })
        expect(a).toEqual('a')
      `,
		},
		{
			code: `
        await waitFor(() => {
          expect(window.fetch).toHaveBeenCalledTimes(1);
          expect(localStorage.setItem).toHaveBeenCalledWith('bar', 'baz');
          expect(window.fetch).toHaveBeenCalledWith('/foo');
        })
      `,
			errors: [
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(() => {
          expect(window.fetch).toHaveBeenCalledTimes(1);
          expect(localStorage.setItem).toHaveBeenCalledWith('bar', 'baz');
        })
        expect(window.fetch).toHaveBeenCalledWith('/foo');
      `,
		},
		{
			code: `
        await waitFor(() => {
          expect(window.fetch).toHaveBeenCalledTimes(1);
          expect(localStorage.setItem).toHaveBeenCalledWith('bar', 'baz');
          expect(window.fetch).toHaveBeenCalledWith('/foo'); // comment
        })
      `,
			errors: [
				{ line: 5, column: 11, messageId: 'noWaitForMultipleAssertion' },
			],
			output: `
        await waitFor(() => {
          expect(window.fetch).toHaveBeenCalledTimes(1);
          expect(localStorage.setItem).toHaveBeenCalledWith('bar', 'baz');
        })
        expect(window.fetch).toHaveBeenCalledWith('/foo'); // comment
      `,
		},
	],
});
