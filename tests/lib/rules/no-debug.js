'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-debug');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('no-debug', rule, {
  valid: [
    {
      code: `foo`,
    },
  ],

  invalid: [
    {
      code: `debug()`,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
  ],
});
