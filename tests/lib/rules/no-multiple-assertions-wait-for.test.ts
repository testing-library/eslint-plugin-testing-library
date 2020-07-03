import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-multiple-assertions-wait-for';

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
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noMultipleAssertionWaitFor' }]
    },
    {
      code: `
        await waitFor(() => {
          expect(a).toEqual('a')
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noMultipleAssertionWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noMultipleAssertionWaitFor' }]
    },
    {
      code: `
        await waitFor(function() {
          expect(a).toEqual('a')
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noMultipleAssertionWaitFor' }]
    }
  ]
})
