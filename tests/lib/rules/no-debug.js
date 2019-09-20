'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-debug');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
});
ruleTester.run('no-debug', rule, {
  valid: [
    {
      code: `debug()`,
    },
    {
      code: `() => {
        const { debug } = foo()
        debug()
      }`,
    },
    {
      code: `
        const debug = require('debug')
        debug()
      `,
    },
    {
      code: `
        const { test } = render(<Component/>)
        test()
      `,
    },
  ],

  invalid: [
    {
      code: `
        const { debug } = render(<Component/>)
        debug()
      `,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
  ],
});
