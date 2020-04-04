import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-wait-for-empty-callback';

const ruleTester = createRuleTester();

const ALL_WAIT_METHODS = ['waitFor', 'waitForElementToBeRemoved'];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(() => {
          screen.getByText(/submit/i)
        })`,
    })),
    ...ALL_WAIT_METHODS.map(m => ({
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
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(() => {})`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}((a, b) => {})`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(() => { /* I'm empty anyway */ })`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),

    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(function() {

      })`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(function(a) {

      })`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(function() {
        // another empty callback
      })`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),

    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(noop)`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),
  ],
});
