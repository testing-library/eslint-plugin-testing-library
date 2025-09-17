import rule, {
	RULE_NAME,
	type MessageIds,
} from '../../../lib/rules/no-wait-for-side-effects';
import { createRuleTester } from '../test-utils';

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

ruleTester.run(RULE_NAME, rule, {
	valid: [
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleValidTestCase>(
			(testingFramework) => [
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(() => expect(a).toEqual('a'))
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(function() {
            expect(a).toEqual('a')
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(() => {
            console.log('testing-library')
            expect(b).toEqual('b')
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(function() {
            console.log('testing-library')
            expect(b).toEqual('b')
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(() => {})
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(function() {})
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(() => {
            // testing
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(function() {
            // testing
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          await waitFor(() => {
            expect(b).toEqual('b')
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          await waitFor(function() {
            expect(b).toEqual('b')
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          userEvent.click(button)
          await waitFor(function() {
            expect(b).toEqual('b')
          })
        `,
				},
				{
					// Issue #500, https://github.com/testing-library/eslint-plugin-testing-library/issues/500
					code: `
          import { waitFor } from '${testingFramework}';
          userEvent.click(button)
          waitFor(function() {
            expect(b).toEqual('b')
          }).then(() => {
            // Side effects are allowed inside .then()
            userEvent.click(button);
          })
        `,
				},
				{
					code: `
          import { waitFor } from '${testingFramework}';
          import { notUserEvent } from 'somewhere-else';

          waitFor(() => {
            await notUserEvent.click(button)
          })
        `,
				},
			]
		),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
		},
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleValidTestCase>(
			(testingFramework) => ({
				code: `
        import { waitFor } from '${testingFramework}';

        anotherFunction(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'});
          userEvent.click(button);
        });

        test('side effects in functions other than waitFor are valid', () => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          userEvent.click(button)
          expect(b).toEqual('b')
        });
      `,
			})
		),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor as renamedWaitFor, fireEvent } from 'test-utils';
        import { waitFor, userEvent } from 'somewhere-else';

        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          userEvent.click(button)
        })
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor, fireEvent as renamedFireEvent, userEvent as renamedUserEvent } from 'test-utils';
        import { fireEvent, userEvent } from 'somewhere-else';

        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          userEvent.click(button)
        })
      `,
		},
		{
			code: `// weird case to cover 100% coverage
      await waitFor(() => {
        const click = firEvent['click']
      })
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => fireEvent.keyDown(input, {key: 'ArrowDown'}))
      `,
		},
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleValidTestCase>(
			(testingFramework) => ({
				settings: { 'testing-library/utils-module': 'test-utils' },
				code: `
        import { waitFor } from 'somewhere-else';
        import { userEvent } from '${testingFramework}';
        await waitFor(() => userEvent.click(button))
      `,
			})
		),
		{
			settings: { 'testing-library/utils-module': '~/test-utils' },
			code: `
        import { waitFor, userEvent } from '~/test-utils';
        await waitFor(() => userEvent.click(button))
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => render(<App />))
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => {
          const { container } = render(<App />)
        })
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        const { rerender } = render(<App />)
        await waitFor(() => {
          rerender(<App />)
        })
      `,
		},
		{
			settings: { 'testing-library/utils-module': '~/test-utils' },
			code: `
        import { waitFor } from '~/test-utils';
        import { render } from 'somewhere-else';
        await waitFor(() => render(<App />))
      `,
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleValidTestCase>(
			(testingFramework) => [
				{
					settings: { 'testing-library/utils-module': '~/test-utils' },
					code: `
          import { waitFor } from '${testingFramework}';
          import { render } from 'somewhere-else';
          await waitFor(() => render(<App />))
        `,
				},
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
          import { waitFor } from '${testingFramework}';
          import { renderWrapper } from 'somewhere-else';
          await waitFor(() => renderWrapper(<App />))
        `,
				},
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
          import { waitFor } from '${testingFramework}';
          import { renderWrapper } from 'somewhere-else';
          await waitFor(() => {
            renderWrapper(<App />)
          })
        `,
				},
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
          import { waitFor } from '${testingFramework}';
          import { renderWrapper } from 'somewhere-else';
          await waitFor(() => {
            const { container } = renderWrapper(<App />)
          })
        `,
				},
			]
		),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => {
          render(<App />)
        })
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'test-utils';
        import { render } from 'somewhere-else';
        await waitFor(() => {
          render(<App />)
        })
      `,
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleValidTestCase>(
			(testingFramework) => [
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
          import { waitFor } from '${testingFramework}';
          await waitFor(() => result = renderWrapper(<App />))
        `,
				},
			]
		),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'test-utils';
        import { render } from 'somewhere-else';
        await waitFor(() => result = render(<App />))
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => result = render(<App />))
      `,
		},
	],
	invalid: [
		// render
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleInvalidTestCase>(
			(testingFramework) => [
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => render(<App />))
      `,
					errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          render(<App />)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          const { container } = renderHelper(<App />)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
        import { waitFor } from '${testingFramework}';
        import { renderHelper } from 'somewhere-else';
        await waitFor(() => renderHelper(<App />))
      `,
					errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
        import { waitFor } from '${testingFramework}';
        import { renderHelper } from 'somewhere-else';
        await waitFor(() => {
          renderHelper(<App />)
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
        import { waitFor } from '${testingFramework}';
        import { renderHelper } from 'somewhere-else';
        await waitFor(() => {
          const { container } = renderHelper(<App />)
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					settings: { 'testing-library/custom-renders': ['renderHelper'] },
					code: `
        import { waitFor } from '${testingFramework}';
        import { renderHelper } from 'somewhere-else';
        let container;
        await waitFor(() => {
          ({ container } = renderHelper(<App />))
        })
      `,
					errors: [{ line: 6, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => result = render(<App />))
      `,
					errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => (a = 5, result = render(<App />)))
      `,
					errors: [{ line: 3, column: 30, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        const { rerender } = render(<App />)
        await waitFor(() => rerender(<App />))
      `,
					errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor, render } from '${testingFramework}';
        await waitFor(() => render(<App />))
      `,
					errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => renderHelper(<App />))
      `,
					errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        import { render } from 'somewhere-else';
        await waitFor(() => render(<App />))
      `,
					errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
			]
		),
		{
			settings: { 'testing-library/utils-module': '~/test-utils' },
			code: `
        import { waitFor, render } from '~/test-utils';
        await waitFor(() => render(<App />))
      `,
			errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleInvalidTestCase>(
			(testingFramework) => [
				{
					settings: { 'testing-library/custom-renders': ['renderWrapper'] },
					code: `
        import { waitFor } from '${testingFramework}';
        import { renderWrapper } from 'somewhere-else';
        await waitFor(() => renderWrapper(<App />))
      `,
					errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          render(<App />)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          const { container } = render(<App />)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          result = render(<App />)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          const a = 5,
          { container } = render(<App />)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        const { rerender } = render(<App />)
        await waitFor(() => {
          rerender(<App />)
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          render(<App />)
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
					errors: [
						{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' },
						{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' },
					],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          render(<App />)
          userEvent.click(button)
        })
      `,
					errors: [
						{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' },
						{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' },
					],
				},
			]
		),
		// fireEvent
		...SUPPORTED_TESTING_FRAMEWORKS.map<RuleInvalidTestCase>(
			(testingFramework) => ({
				code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => fireEvent.keyDown(input, {key: 'ArrowDown'}))
      `,
				errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
			})
		),
		{
			settings: { 'testing-library/utils-module': '~/test-utils' },
			code: `
        import { waitFor, fireEvent } from '~/test-utils';
        await waitFor(() => fireEvent.keyDown(input, {key: 'ArrowDown'}))
      `,
			errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleInvalidTestCase>(
			(testingFramework) => [
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor, fireEvent as renamedFireEvent } from '${testingFramework}';
        await waitFor(() => {
          renamedFireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
			]
		),
		{
			settings: { 'testing-library/utils-module': '~/test-utils' },
			code: `
        import { waitFor, fireEvent } from '~/test-utils';
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
			errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleInvalidTestCase>(
			(testingFramework) => [
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
			]
		),
		// userEvent
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleInvalidTestCase>(
			(testingFramework) => [
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => userEvent.click(button))
      `,
					errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          userEvent.click(button)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        import renamedUserEvent from '@testing-library/user-event'
        await waitFor(() => {
          renamedUserEvent.click(button)
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
			]
		),
		{
			settings: { 'testing-library/utils-module': '~/test-utils' },
			code: `
        import { waitFor } from '~/test-utils';
        import userEvent from '@testing-library/user-event'
        await waitFor(() => {
          userEvent.click();
        })
      `,
			errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleInvalidTestCase>(
			(testingFramework) => [
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          expect(b).toEqual('b')
          userEvent.click(button)
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(() => {
          userEvent.click(button)
          expect(b).toEqual('b')
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          userEvent.click(button)
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          expect(b).toEqual('b')
          userEvent.click(button)
        })
      `,
					errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					code: `
        import { waitFor } from '${testingFramework}';
        await waitFor(function() {
          userEvent.click(button)
          expect(b).toEqual('b')
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					// Issue #500, https://github.com/testing-library/eslint-plugin-testing-library/issues/500
					code: `
        import { waitFor } from '${testingFramework}';
        waitFor(function() {
          userEvent.click(button)
          expect(b).toEqual('b')
        }).then(() => {
          userEvent.click(button) // Side effects are allowed inside .then()
          expect(b).toEqual('b')
        })
      `,
					errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
				},
				{
					// Issue #500, https://github.com/testing-library/eslint-plugin-testing-library/issues/500
					code: `
        import { waitFor } from '${testingFramework}';
        waitFor(function() {
          userEvent.click(button)
          expect(b).toEqual('b')
        }).then(() => {
          userEvent.click(button) // Side effects are allowed inside .then()
          expect(b).toEqual('b')
          await waitFor(() => {
            fireEvent.keyDown(input, {key: 'ArrowDown'}) // But not if there is a another waitFor with side effects inside the .then()
            expect(b).toEqual('b')
          })
        })
      `,
					errors: [
						{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' },
						{ line: 10, column: 13, messageId: 'noSideEffectsWaitFor' },
					],
				},
			]
		),

		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `// all mixed
        import { waitFor, fireEvent as renamedFireEvent, screen } from '~/test-utils';
        import userEvent from '@testing-library/user-event'
        import { fireEvent } from 'somewhere-else'

        test('check all mixed', async () => {
          const button = await screen.findByRole('button')
          await waitFor(() => {
            renamedFireEvent.keyDown(input, {key: 'ArrowDown'})
            expect(b).toEqual('b')
            fireEvent.keyDown(input, {key: 'ArrowDown'})
            userEvent.click(button)
            someBool ? 'a' : 'b' // cover expression statement without identifier for 100% coverage
          })
        })
      `,
			errors: [
				{ line: 9, column: 13, messageId: 'noSideEffectsWaitFor' },
				{ line: 12, column: 13, messageId: 'noSideEffectsWaitFor' },
			],
		},
		// side effects (userEvent, fireEvent or render) in variable declarations
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleInvalidTestCase>(
			(testingFramework) => [
				{
					// Issue #368, https://github.com/testing-library/eslint-plugin-testing-library/issues/368
					code: `
        import { waitFor } from '${testingFramework}';
        import userEvent from '@testing-library/user-event'
        await waitFor(() => {
          const a = userEvent.click(button);
          const b = fireEvent.click(button);
          const wrapper = render(<App />);
        })
        `,
					errors: [
						{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' },
						{ line: 6, column: 11, messageId: 'noSideEffectsWaitFor' },
						{ line: 7, column: 11, messageId: 'noSideEffectsWaitFor' },
					],
				},
			]
		),

		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<InvalidTestCase<MessageIds, []>>(
			(testingFramework) => [
				{
					code: `
        import { waitFor } from '${testingFramework}';
        import userEvent from '@testing-library/user-event'

        it("some test", async () => {
          await waitFor(async () => {
            await fireEvent.click(screen.getByTestId("something"));
          });
        });
        `,
					errors: [{ line: 7, column: 13, messageId: 'noSideEffectsWaitFor' }],
				},
			]
		),
	],
});
