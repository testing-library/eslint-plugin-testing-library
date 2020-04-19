'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-await-sync-query');
const {
  SYNC_QUERIES_COMBINATIONS,
  ASYNC_QUERIES_COMBINATIONS,
} = require('../../../lib/utils');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('no-await-sync-query', rule, {
  valid: [
    // sync queries without await are valid
    ...SYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `() => {
        ${query}('foo')
      }
      `,
    })),

    // async queries with await operator are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        await ${query}('foo')
      }
      `,
    })),

    // async queries with then method are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `() => {
        ${query}('foo').then(() => {});
      }
      `,
    })),
  ],

  invalid: [
    // sync queries with await operator are not valid
    ...SYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        await ${query}('foo')
      }
      `,
      errors: [
        {
          messageId: 'noAwaitSyncQuery',
        },
      ],
    })),

    // sync queries in screen with await operator are not valid
    ...SYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        await screen.${query}('foo')
      }
      `,
      errors: [
        {
          messageId: 'noAwaitSyncQuery',
        },
      ],
    })),
  ],
});
