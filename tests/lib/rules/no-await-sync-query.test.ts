import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-await-sync-query';
import {
  SYNC_QUERIES_COMBINATIONS,
  ASYNC_QUERIES_COMBINATIONS,
} from '../../../lib/utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // sync queries without await are valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `() => {
        ${query}('foo')
      }
      `,
    })),

    // async queries with await operator are valid
    ...ASYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `async () => {
        await ${query}('foo')
      }
      `,
    })),

    // async queries with then method are valid
    ...ASYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `() => {
        ${query}('foo').then(() => {});
      }
      `,
    })),
  ],

  invalid: [
    // sync queries with await operator are not valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
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
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
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
