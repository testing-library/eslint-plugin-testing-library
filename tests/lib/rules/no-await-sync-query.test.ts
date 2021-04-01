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
        const element = ${query}('foo')
      }
      `,
    })),
    // custom sync queries without await are valid
    `() => {
      const element = getByIcon('search')
    }
    `,
    `() => {
      const element = queryByIcon('search')
    }
    `,
    `() => {
      const element = getAllByIcon('search')
    }
    `,
    `() => {
      const element = queryAllByIcon('search')
    }
    `,
    `async () => {
      await waitFor(() => {
        getByText('search');
      });
    }
    `,
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

    // sync query awaited but not related to custom module is invalid but not reported
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { screen } from 'somewhere-else'
      () => {
        const element = await screen.getByRole('button')
      }
      `,
    },

    // https://github.com/testing-library/eslint-plugin-testing-library/issues/276
    `
    // sync query within call expression but not part of the callee
    const chooseElementFromSomewhere = async (text, getAllByLabelText) => {
      const someElement = getAllByLabelText(text)[0].parentElement;
      // ...
      await someOtherAsyncFunction();
    };
     
    await chooseElementFromSomewhere('someTextToUseInAQuery', getAllByLabelText);
    `,

    `// edge case for coverage:
     // valid use case without call expression
     // so there is no innermost function scope found
     await test('edge case for no innermost function scope', () => {
      const foo = getAllByLabelText
    })
    `,

    `// edge case for coverage: CallExpression without deepest Identifier
     await someList[0]();
    `,
  ],

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
    // custom sync queries with await operator are not valid
    {
      code: `
      async () => {
        const element = await getByIcon('search')
      }
      `,
      errors: [{ messageId: 'noAwaitSyncQuery', line: 3, column: 31 }],
    },
    {
      code: `
      async () => {
        const element = await queryByIcon('search')
      }
      `,
      errors: [{ messageId: 'noAwaitSyncQuery', line: 3, column: 31 }],
    },
    {
      code: `
      async () => {
        const element = await screen.getAllByIcon('search')
      }
      `,
      errors: [{ messageId: 'noAwaitSyncQuery', line: 3, column: 38 }],
    },
    {
      code: `
      async () => {
        const element = await screen.queryAllByIcon('search')
      }
      `,
      errors: [{ messageId: 'noAwaitSyncQuery', line: 3, column: 38 }],
    },
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

    // sync query awaited and related to testing library module
    // with custom module setting is not valid
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { screen } from '@testing-library/react'
      () => {
        const element = await screen.getByRole('button')
      }
      `,
      errors: [{ messageId: 'noAwaitSyncQuery', line: 4, column: 38 }],
    },
    // sync query awaited and related to custom module is not valid
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { screen } from 'test-utils'
      () => {
        const element = await screen.getByRole('button')
      }
      `,
      errors: [{ messageId: 'noAwaitSyncQuery', line: 4, column: 38 }],
    },
  ],
});
