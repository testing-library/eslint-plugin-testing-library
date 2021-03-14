import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-wait-for-empty-callback';

const ruleTester = createRuleTester();

const ALL_WAIT_METHODS = ['waitFor', 'waitForElementToBeRemoved'];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(() => {
          screen.getByText(/submit/i)
        })`,
    })),
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(function() {
          screen.getByText(/submit/i)
        })`,
    })),
    {
      code: `waitForElementToBeRemoved(someNode)`,
    },
    {
      code: `waitForElementToBeRemoved(() => someNode)`,
    },
    {
      code: `waitSomethingElse(() => {})`,
    },
    {
      code: `wait(() => {})`,
    },
  ],

  invalid: [
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(() => {})`,
      errors: [
        {
          line: 1,
          column: 8 + m.length,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: m,
          },
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}((a, b) => {})`,
      errors: [
        {
          line: 1,
          column: 12 + m.length,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: m,
          },
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(() => { /* I'm empty anyway */ })`,
      errors: [
        {
          line: 1,
          column: 8 + m.length,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: m,
          },
        },
      ],
    })),

    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(function() {

      })`,
      errors: [
        {
          line: 1,
          column: 13 + m.length,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: m,
          },
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(function(a) {

      })`,
      errors: [
        {
          line: 1,
          column: 14 + m.length,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: m,
          },
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(function() {
        // another empty callback
      })`,
      errors: [
        {
          line: 1,
          column: 13 + m.length,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: m,
          },
        },
      ],
    })),

    ...ALL_WAIT_METHODS.map((m) => ({
      code: `${m}(noop)`,
      errors: [
        {
          line: 1,
          column: 2 + m.length,
          messageId: 'noWaitForEmptyCallback',
          data: {
            methodName: m,
          },
        },
      ],
    })),
  ],
});
