'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/await-async-query');
const {
  SYNC_QUERIES_COMBINATIONS,
  ASYNC_QUERIES_COMBINATIONS,
} = require('../../../lib/utils');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('await-async-query', rule, {
  valid: [
    // async queries declaration are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `
        const { ${query} } = setUp()
      `,
    })),

    // async queries with await operator are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        doSomething()
        await ${query}('foo')
      }
      `,
    })),

    // async queries with promise in variable and await operator are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        const promise = ${query}('foo')
        await promise
      }
      `,
    })),

    // async queries with then method are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `() => {
        ${query}('foo').then(() => {
          done()
        })
      }
      `,
    })),

    // async queries with promise in variable and then method are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `() => {
        const promise = ${query}('foo')
        promise.then(() => done())
      }
      `,
    })),

    // async queries with promise returned in arrow function definition are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `anArrowFunction = () => ${query}('foo')`,
    })),

    // async queries with promise returned in regular function definition are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `function foo() { return ${query}('foo') }`,
    })),

    // async queries with promise in variable and returned in regular function definition are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `function foo() {
        const promise = ${query}('foo')
        return promise
      }
      `,
    })),

    // sync queries are valid
    ...SYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `() => {
        doSomething()
        ${query}('foo')
      }
      `,
    })),

    // non-existing queries are valid
    {
      code: `async () => {
        doSomething()
        const foo = findByNonExistingTestingLibraryQuery('foo')
      }
      `,
    },
  ],

  invalid:
    // async queries without await operator or then method are not valid
    ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        doSomething()
        const foo = ${query}('foo')
      }
      `,
      errors: [
        {
          messageId: 'awaitAsyncQuery',
        },
      ],
    })),
});
