import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-await-sync-query';
import {
  SYNC_QUERIES_COMBINATIONS,
  ASYNC_QUERIES_COMBINATIONS,
} from '../../../lib/utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  // TODO: add variants for custom queries for each map
  valid: [
    // sync queries without await are valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `() => {
        const element = ${query}('foo')
      }
      `,
    })),
    // sync queries without await inside assert are valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `() => {
        expect(${query}('foo')).toBeEnabled()
      }
      `,
    })),

    // async queries with await operator are valid
    ...ASYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `async () => {
        const element = await ${query}('foo')
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

  // TODO: add variants for custom queries for each map
  invalid: [
    // sync queries with await operator are not valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `async () => {
        const element = await ${query}('foo')
      }
      `,
      errors: [
        {
          messageId: 'noAwaitSyncQuery',
          line: 2,
          column: 31,
        },
      ],
    })),
    // sync queries with await operator inside assert are not valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `async () => {
        expect(await ${query}('foo')).toBeEnabled()
      }
      `,
      errors: [
        {
          messageId: 'noAwaitSyncQuery',
          line: 2,
          column: 22,
        },
      ],
    })),

    // sync queries in screen with await operator are not valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `async () => {
        const element = await screen.${query}('foo')
      }
      `,
      errors: [
        {
          messageId: 'noAwaitSyncQuery',
          line: 2,
          column: 38,
        },
      ],
    })),

    // sync queries in screen with await operator inside assert are not valid
    ...SYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `async () => {
        expect(await screen.${query}('foo')).toBeEnabled()
      }
      `,
      errors: [
        {
          messageId: 'noAwaitSyncQuery',
          line: 2,
          column: 29,
        },
      ],
    })),
  ],
});
