'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/await-async-query');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('await-async-query', rule, {
  valid: [
    {
      code: `
        const { findByText } = setUp()
      `,
    },
    {
      code: `async () => {
        const foo = await findByText('foo')
      }
      `,
    },
    {
      code: `async () => {
        doSomething()
        const foo = await findByText('foo')
      }
      `,
    },
    {
      code: `async () => {
        doSomething()
        const foo = await findAllByText('foo')
      }
      `,
    },
    {
      code: `anArrowFunction = () => findByText('foo')`,
    },
    {
      code: `function foo() {return findByText('foo')}`,
    },
    {
      code: `function foo() {
        const promise = findByText('foo')
        return promise
      }`,
    },
    {
      code: `async () => {
        doSomething()
        const foo = findByNonExistingTestingLibraryQuery('foo')
      }
      `,
    },
  ],

  invalid: [
    {
      code: `async () => {
        const foo = findByText('foo')
      }
      `,
      errors: [
        {
          messageId: 'awaitAsyncQuery',
        },
      ],
    },
    {
      code: `async () => {
        doSomething()
        const foo = findByText('foo')
      }
      `,
      errors: [
        {
          messageId: 'awaitAsyncQuery',
        },
      ],
    },
    {
      code: `async () => {
        doSomething()
        const foo = findAllByText('foo')
      }
      `,
      errors: [
        {
          messageId: 'awaitAsyncQuery',
        },
      ],
    },
  ],
});
