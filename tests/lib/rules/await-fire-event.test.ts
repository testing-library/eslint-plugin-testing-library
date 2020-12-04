import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/await-fire-event';

const ruleTester = createRuleTester();

// TODO: add cases for fireEvent method destructured
// TODO: add import statement to all current cases
// TODO: add cases for fireEvent wildcard imported
// TODO: add cases for fireEvent method promise returned from function
// TODO: add cases for fireEvent not coming from TL
// TODO: iterate cases for more fireEvent method variants

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `fireEvent.click`,
    },
    {
      code: `async () => {
        await fireEvent.click(getByText('Click me'))
      }
      `,
    },
    {
      code: `async () => {
        await fireEvent.focus(getByLabelText('username'))
        await fireEvent.blur(getByLabelText('username'))
      }
      `,
    },
    {
      code: `done => {
        fireEvent.click(getByText('Click me')).then(() => { done() })
      }
      `,
    },
    {
      code: `done => {
        fireEvent.focus(getByLabelText('username')).then(() => {
          fireEvent.blur(getByLabelText('username')).then(() => { done() })
        })
      }
      `,
    },
    {
      code: `() => {
        return fireEvent.click(getByText('Click me'))
      }
      `,
    },
    {
      code: `() => fireEvent.click(getByText('Click me'))
      `,
    },
    {
      code: `function clickUtil() {
        doSomething()
        return fireEvent.click(getByText('Click me'))
      }
      `,
    },
  ],

  invalid: [
    {
      code: `() => {
        fireEvent.click(getByText('Click me'))
      }
      `,
      errors: [
        {
          column: 19,
          messageId: 'awaitFireEvent',
        },
      ],
    },
    {
      code: `() => {
        fireEvent.focus(getByLabelText('username'))
        fireEvent.blur(getByLabelText('username'))
      }
      `,
      errors: [
        {
          line: 2,
          column: 19,
          messageId: 'awaitFireEvent',
        },
        {
          line: 3,
          column: 19,
          messageId: 'awaitFireEvent',
        },
      ],
    },
  ],
});
