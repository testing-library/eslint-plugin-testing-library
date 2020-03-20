'use strict';

const rule = require('../../../lib/rules/no-wait-for-empty-callback');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });

const ALL_WAIT_METHODS = ['waitFor', 'waitForElementToBeRemoved'];

ruleTester.run('no-wait-for-empty-callback', rule, {
  valid: [
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(() => {
          screen.getByText(/submit/i)
        })`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),
    ...ALL_WAIT_METHODS.map(m => ({
      code: `${m}(function() {
          screen.getByText(/submit/i)
        })`,
      errors: [
        {
          messageId: 'noWaitForEmptyCallback',
        },
      ],
    })),
    {
      code: `waitSomethingElse(() => {})`,
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
      code: `${m}(function() {

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
