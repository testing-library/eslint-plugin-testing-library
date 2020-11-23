import { TestCaseError } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/await-async-query';
import {
  ASYNC_QUERIES_COMBINATIONS,
  ASYNC_QUERIES_VARIANTS,
  combineQueries,
  SYNC_QUERIES_COMBINATIONS,
} from '../../../lib/utils';

const ruleTester = createRuleTester();

interface TestCode {
  code: string;
  isAsync?: boolean;
}

function createTestCode({ code, isAsync = true }: TestCode) {
  return `
    import { render } from '@testing-library/react'
    test("An example test",${isAsync ? ' async ' : ' '}() => {
      ${code}
    })
  `;
}

interface TestCaseParams {
  isAsync?: boolean;
  combinations?: string[];
  errors?: TestCaseError<'awaitAsyncQuery'>[];
}

// TODO: simplify test cases generation
function createTestCase(
  getTest: (
    query: string
  ) => string | { code: string; errors?: TestCaseError<'awaitAsyncQuery'>[] },
  { combinations = ASYNC_QUERIES_COMBINATIONS, isAsync }: TestCaseParams = {}
) {
  return combinations.map((query) => {
    const test = getTest(query);

    return typeof test === 'string'
      ? { code: createTestCode({ code: test, isAsync }), errors: [] }
      : {
          code: createTestCode({ code: test.code, isAsync }),
          errors: test.errors,
        };
  });
}

const CUSTOM_ASYNC_QUERIES_COMBINATIONS = combineQueries(
  ASYNC_QUERIES_VARIANTS,
  ['ByIcon', 'ByButton']
);

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // async queries declaration from render functions are valid
    ...createTestCase((query) => `const { ${query} } = render()`, {
      isAsync: false,
    }),

    // async screen queries declaration are valid
    ...createTestCase((query) => `await screen.${query}('foo')`),

    // async queries are valid with await operator
    ...createTestCase(
      (query) => `
        doSomething()
        await ${query}('foo')
      `
    ),

    // async queries are valid when saved in a variable with await operator
    ...createTestCase(
      (query) => `
        doSomething()
        const foo = await ${query}('foo')
        expect(foo).toBeInTheDocument();
      `
    ),

    // async queries are valid when saved in a promise variable immediately resolved
    ...createTestCase(
      (query) => `
        const promise = ${query}('foo')
        await promise
      `
    ),

    // async queries are valid when saved in a promise variable resolved by an await operator
    ...createTestCase(
      (query) => `
        const promise = ${query}('foo')
        await promise
      `
    ),

    // async queries are valid when used with then method
    ...createTestCase(
      (query) => `
        ${query}('foo').then(() => {
          done()
        })
      `
    ),

    // async queries are valid with promise in variable resolved by then method
    ...createTestCase(
      (query) => `
        const promise = ${query}('foo')
        promise.then((done) => done())
      `
    ),

    // async queries are valid with promise returned in arrow function
    ...createTestCase(
      (query) => `const anArrowFunction = () => ${query}('foo')`
    ),

    // async queries are valid with promise returned in regular function
    ...createTestCase((query) => `function foo() { return ${query}('foo') }`),

    // async queries are valid with promise in variable and returned in regular function
    ...createTestCase(
      (query) => `
        const promise = ${query}('foo')
        return promise
      `
    ),

    // sync queries are valid
    ...createTestCase(
      (query) => `
        doSomething()
        ${query}('foo')
      `,
      { combinations: SYNC_QUERIES_COMBINATIONS }
    ),

    // async queries with resolves matchers are valid
    ...createTestCase(
      (query) => `
        expect(${query}("foo")).resolves.toBe("bar")
        expect(wrappedQuery(${query}("foo"))).resolves.toBe("bar")
      `
    ),

    // async queries with rejects matchers are valid
    ...createTestCase(
      (query) => `
        expect(${query}("foo")).rejects.toBe("bar")
        expect(wrappedQuery(${query}("foo"))).rejects.toBe("bar")
      `
    ),
  ],

  // TODO: improve invalid cases by
  //  - checking line and column
  //  - check references from functions
  invalid: [
    // built-in async queries without await operator or then method are not valid
    ...createTestCase((query) => ({
      code: `
        doSomething()
        const foo = ${query}('foo')
      `,
      errors: [{ messageId: 'awaitAsyncQuery' }],
    })),
    // custom async queries without await operator or then method are not valid
    ...createTestCase(
      (query) => ({
        code: `
        doSomething()
        const foo = ${query}('foo')
      `,
        errors: [{ messageId: 'awaitAsyncQuery' }],
      }),
      { combinations: CUSTOM_ASYNC_QUERIES_COMBINATIONS }
    ),

    // built-in async screen queries without await operator or then method are not valid
    ...createTestCase((query) => ({
      code: `screen.${query}('foo')`,
      errors: [{ messageId: 'awaitAsyncQuery' }],
    })),

    // custom async screen queries without await operator or then method are not valid
    ...createTestCase(
      (query) => ({
        code: `screen.${query}('foo')`,
        errors: [{ messageId: 'awaitAsyncQuery' }],
      }),
      { combinations: CUSTOM_ASYNC_QUERIES_COMBINATIONS }
    ),

    ...createTestCase((query) => ({
      code: `
        const foo = ${query}('foo')
        expect(foo).toBeInTheDocument()
        expect(foo).toHaveAttribute('src', 'bar');
      `,
      errors: [
        {
          line: 5,
          messageId: 'awaitAsyncQuery',
          data: {
            name: query,
          },
        },
      ],
    })),

    // unresolved built-in async queries are not valid (aggressive reporting)
    ...ASYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `
        import { render } from "another-library"

        test('An example test', async () => {
          const example = ${query}("my example")
        })
      `,
      errors: [{ messageId: 'awaitAsyncQuery', line: 5, column: 27 }],
    })),

    // unresolved custom async queries are not valid (aggressive reporting)
    ...CUSTOM_ASYNC_QUERIES_COMBINATIONS.map((query) => ({
      code: `
        import { render } from "another-library"

        test('An example test', async () => {
          const example = ${query}("my example")
        })
      `,
      errors: [{ messageId: 'awaitAsyncQuery', line: 5, column: 27 }],
    })),
  ],
});
