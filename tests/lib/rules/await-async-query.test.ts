import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/await-async-query';
import {
  ASYNC_QUERIES_COMBINATIONS,
  SYNC_QUERIES_COMBINATIONS,
} from '../../../lib/utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // async queries declaration are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `
        const { ${query} } = setUp()
      `,
    })),

    // async queries declaration are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        await screen.${query}('foo')
      }
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

    // async queries saving element in var with await operator are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        doSomething()
        const foo = await ${query}('foo')
        expect(foo).toBeInTheDocument();
      }
      `,
    })),

    // async queries saving element in var with promise immediately resolved are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `async () => {
        doSomething()
        const foo = ${query}('foo').then(node => node)
        expect(foo).toBeInTheDocument();
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

    // resolves/rejects matchers are valid
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `test(() => {
        expect(${query}("foo")).resolves.toBe("bar")
        expect(wrappedQuery(${query}("foo"))).resolves.toBe("bar")
      })
      `,
    })),
    ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
      code: `test(() => {
        expect(${query}("foo")).rejects.toBe("bar")
        expect(wrappedQuery(${query}("foo"))).rejects.toBe("bar")
      })
      `,
    })),
  ],

  invalid:
    // async queries without await operator or then method are not valid
    [
      ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
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
      ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
        code: `async () => {
        screen.${query}('foo')
      }
      `,
        errors: [
          {
            messageId: 'awaitAsyncQuery',
          },
        ],
      })),
      ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
        code: `const foo = screen.${query}('foo')`,
        errors: [
          {
            messageId: 'awaitAsyncQuery',
          },
        ],
      })),
      ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
        code: `async () => {
        const foo = ${query}('foo')
        expect(foo).toBeInTheDocument()
        expect(foo).toHaveAttribute('src', 'bar');
      }
      `,
        errors: [
          {
            line: 2,
            messageId: 'awaitAsyncQuery',
            data: {
              name: query,
            },
          },
        ],
      })),
      ...ASYNC_QUERIES_COMBINATIONS.map(query => ({
        code: `async () => {
        expect(${query}('foo')).toBeInTheDocument()
      }
      `,
        errors: [
          {
            line: 2,
            messageId: 'awaitAsyncQuery',
            data: {
              name: query,
            },
          },
        ],
      })),
    ],
});
