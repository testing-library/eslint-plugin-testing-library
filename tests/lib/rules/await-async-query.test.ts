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
  errors?: TestCaseError<'awaitAsyncQuery' | 'asyncQueryWrapper'>[];
}

function createTestCase(
  getTest: (
    query: string
  ) => string | { code: string; errors?: TestCaseError<'awaitAsyncQuery'>[] },
  {
    combinations = ALL_ASYNC_COMBINATIONS_TO_TEST,
    isAsync,
  }: TestCaseParams = {}
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

// built-in queries + custom queries
const ALL_ASYNC_COMBINATIONS_TO_TEST = [
  ...ASYNC_QUERIES_COMBINATIONS,
  ...CUSTOM_ASYNC_QUERIES_COMBINATIONS,
];

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

    // async queries are valid when wrapped within Promise.all + await expression
    ...createTestCase(
      (query) => `
        doSomething()
        
        await Promise.all([
          ${query}('foo'),
          ${query}('bar'),
        ]);
      `
    ),

    // async queries are valid when wrapped within Promise.all + then chained
    ...createTestCase(
      (query) => `
        doSomething()
        
        Promise.all([
          ${query}('foo'),
          ${query}('bar'),
        ]).then()
      `
    ),

    // async queries are valid when wrapped within Promise.allSettled + await expression
    ...createTestCase(
      (query) => `
        doSomething()
        
        await Promise.allSettled([
          ${query}('foo'),
          ${query}('bar'),
        ]);
      `
    ),

    // async queries are valid when wrapped within Promise.allSettled + then chained
    ...createTestCase(
      (query) => `
        doSomething()
        
        Promise.allSettled([
          ${query}('foo'),
          ${query}('bar'),
        ]).then()
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
        async function queryWrapper() {
          const promise = ${query}('foo')
          return promise
        }
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

    // unresolved async queries with aggressive reporting opted-out are valid
    ...ALL_ASYNC_COMBINATIONS_TO_TEST.map((query) => ({
      settings: { 'testing-library/module': 'test-utils' },
      code: `
        import { render } from "another-library"

        test('An example test', async () => {
          const example = ${query}("my example")
        })
      `,
    })),

    // non-matching query is valid
    `
    test('An valid example test', async () => {
      const example = findText("my example")
    })
    `,

    // unhandled promise from non-matching query is valid
    `
    async function findButton() {
      const element = findByText('outer element')
      return somethingElse(element)
    }

    test('An valid example test', async () => {
      // findButton doesn't match async query pattern
      const button = findButton()
    })
    `,

    // edge case for coverage
    // return non-matching query and other than Identifier or CallExpression
    `
    async function someSetup() {
      const element = await findByText('outer element')
      return element ? findSomethingElse(element) : null
    }

    test('An valid example test', async () => {
      someSetup()
    })
    `,

    // edge case for coverage
    // valid async query usage without any function defined
    // so there is no innermost function scope found
    `const element = await findByRole('button')`,
  ],

  invalid: [
    // async queries without await operator or then method are not valid
    ...createTestCase((query) => ({
      code: `
        doSomething()
        const foo = ${query}('foo')
      `,
      errors: [{ messageId: 'awaitAsyncQuery', line: 6, column: 21 }],
    })),

    // async screen queries without await operator or then method are not valid
    ...createTestCase((query) => ({
      code: `screen.${query}('foo')`,
      errors: [{ messageId: 'awaitAsyncQuery', line: 4, column: 14 }],
    })),

    ...createTestCase((query) => ({
      code: `
        const foo = ${query}('foo')
        expect(foo).toBeInTheDocument()
        expect(foo).toHaveAttribute('src', 'bar');
      `,
      errors: [
        {
          line: 5,
          column: 21,
          messageId: 'awaitAsyncQuery',
          data: {
            name: query,
          },
        },
      ],
    })),

    // unresolved async queries are not valid (aggressive reporting)
    ...ALL_ASYNC_COMBINATIONS_TO_TEST.map((query) => ({
      code: `
        import { render } from "another-library"

        test('An example test', async () => {
          const example = ${query}("my example")
        })
      `,
      errors: [{ messageId: 'awaitAsyncQuery', line: 5, column: 27 }],
    })),

    // unhandled promise from async query function wrapper is invalid
    ...ALL_ASYNC_COMBINATIONS_TO_TEST.map((query) => ({
      code: `
        function queryWrapper() {
          doSomethingElse();
          
          return screen.${query}('foo')
        }
        
        test("An invalid example test", () => {
          const element = queryWrapper()
        })
        
        test("An valid example test", async () => {
          const element = await queryWrapper()
        })
      `,
      errors: [{ messageId: 'asyncQueryWrapper', line: 9, column: 27 }],
    })),
    // unhandled promise from async query arrow function wrapper is invalid
    ...ALL_ASYNC_COMBINATIONS_TO_TEST.map((query) => ({
      code: `
        const queryWrapper = () => {
          doSomethingElse();

          return ${query}('foo')
        }

        test("An invalid example test", () => {
          const element = queryWrapper()
        })

        test("An valid example test", async () => {
          const element = await queryWrapper()
        })
      `,
      errors: [{ messageId: 'asyncQueryWrapper', line: 9, column: 27 }],
    })),
    // unhandled promise implicitly returned from async query arrow function wrapper is invalid
    ...ALL_ASYNC_COMBINATIONS_TO_TEST.map((query) => ({
      code: `
        const queryWrapper = () => screen.${query}('foo')

        test("An invalid example test", () => {
          const element = queryWrapper()
        })

        test("An valid example test", async () => {
          const element = await queryWrapper()
        })
      `,
      errors: [{ messageId: 'asyncQueryWrapper', line: 5, column: 27 }],
    })),
  ],
});
