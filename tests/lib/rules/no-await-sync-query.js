'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-await-sync-query');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('no-await-sync-query', rule, {
  valid: [
    {
      code: `async () => {
        getByText('foo')
      }
      `,
    },
  ],

  invalid: [
    {
      code: `async () => {
        await getByText('foo')
      }
      `,
      errors: [
        {
          messageId: 'noAwaitSyncQuery',
        },
      ],
    },
  ],
});
