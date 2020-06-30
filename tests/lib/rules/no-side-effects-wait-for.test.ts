import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-side-effects-wait-for';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run(RULE_NAME, rule, {
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
    {
      code: `
        await waitFor(function() {
          // testing
        })
      `,
    }
  ],
  invalid: [
    // fireEvent
    {
      code: `
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(() => {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    // userEvent
    {
      code: `
        await waitFor(() => {
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(() => {
          expect(b).toEqual('b')
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(() => {
          userEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          expect(b).toEqual('b')
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          userEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    }
  ]
})
