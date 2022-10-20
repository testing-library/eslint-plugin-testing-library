import { TSESLint } from '@typescript-eslint/utils';

import rule, { RULE_NAME } from '../../../lib/rules/await-async-query';
import {
	ASYNC_QUERIES_COMBINATIONS,
	ASYNC_QUERIES_VARIANTS,
	combineQueries,
	SYNC_QUERIES_COMBINATIONS,
} from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/dom',
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/vue',
	'@marko/testing-library',
];

interface TestCode {
	code: string;
	isAsync?: boolean;
	testingFramework: string;
}

function createTestCode({
	code,
	isAsync = true,
	testingFramework = '@testing-library/react',
}: TestCode) {
	return `
      import { render } from '${testingFramework}'
      test("An example test",${isAsync ? ' async ' : ' '}() => {
        ${code}
      })
    `;
}

interface TestCaseParams {
	isAsync?: boolean;
	combinations?: string[];
	errors?: TSESLint.TestCaseError<'asyncQueryWrapper' | 'awaitAsyncQuery'>[];
	testingFramework?: string;
}

function createTestCase(
	getTest: (
		query: string
	) =>
		| string
		| { code: string; errors?: TSESLint.TestCaseError<'awaitAsyncQuery'>[] },
	{
		combinations = ALL_ASYNC_COMBINATIONS_TO_TEST,
		isAsync,
		testingFramework = '',
	}: TestCaseParams = {}
) {
	return combinations.map((query) => {
		const test = getTest(query);

		return typeof test === 'string'
			? {
					code: createTestCode({ code: test, isAsync, testingFramework }),
					errors: [],
			  }
			: {
					code: createTestCode({ code: test.code, isAsync, testingFramework }),
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

		// async @marko/testing-library screen queries declaration are valid
		...createTestCase((query) => `await screen.${query}('foo')`, {
			testingFramework: '@marko/testing-library',
		}),

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
		// async queries with toResolve matchers are valid
		...createTestCase(
			(query) => `
        expect(${query}("foo")).toResolve()
        expect(wrappedQuery(${query}("foo"))).toResolve()
      `
		),

		// async queries with rejects matchers are valid
		...createTestCase(
			(query) => `
        expect(${query}("foo")).rejects.toBe("bar")
        expect(wrappedQuery(${query}("foo"))).rejects.toBe("bar")
      `
		),

		// async queries with toReject matchers are valid
		...createTestCase(
			(query) => `
        expect(${query}("foo")).toReject()
        expect(wrappedQuery(${query}("foo"))).toReject()
      `
		),

		// unresolved async queries with aggressive reporting opted-out are valid
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map((query) => ({
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { render } from "another-library"

        test('An example test', async () => {
          const example = ${query}("my example")
        })
      `,
		})),

		// non-matching query is valid
		`
    test('A valid example test', async () => {
      const example = findText("my example")
    })
    `,

		// unhandled promise from non-matching query is valid
		`
    async function findButton() {
      const element = findByText('outer element')
      return somethingElse(element)
    }

    test('A valid example test', async () => {
      // findButton doesn't match async query pattern
      const button = findButton()
    })
    `,

		// unhandled promise from custom query not matching custom-queries setting is valid
		{
			settings: {
				'testing-library/custom-queries': ['queryByIcon', 'ByComplexText'],
			},
			code: `
      test('A valid example test', () => {
        const element = findByIcon('search')
      })
      `,
		},

		// unhandled promise from custom query with aggressive query switched off is valid
		{
			settings: {
				'testing-library/custom-queries': 'off',
			},
			code: `
      test('A valid example test', () => {
        const element = findByIcon('search')
      })
      `,
		},

		// edge case for coverage
		// return non-matching query and other than Identifier or CallExpression
		`
    async function someSetup() {
      const element = await findByText('outer element')
      return element ? findSomethingElse(element) : null
    }

    test('A valid example test', async () => {
      someSetup()
    })
    `,

		// https://github.com/testing-library/eslint-plugin-testing-library/issues/359
		`// issue #359
      import { render, screen } from 'mocks/test-utils'
      import userEvent from '@testing-library/user-event'

      const testData = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'extremeSecret',
      }

      const selectors = {
        username: () => screen.findByRole('textbox', { name: /username/i }),
        email: () => screen.findByRole('textbox', { name: /e-mail/i }),
        password: () => screen.findByLabelText(/password/i),
      }

      test('this is a valid case', async () => {
        render(<SomeComponent />)
        userEvent.type(await selectors.username(), testData.name)
        userEvent.type(await selectors.email(), testData.email)
        userEvent.type(await selectors.password(), testData.password)
        // ...
      })
    `,

		// edge case for coverage
		// valid async query usage without any function defined
		// so there is no innermost function scope found
		`const element = await findByRole('button')`,
	],

	invalid: [
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) =>
			ALL_ASYNC_COMBINATIONS_TO_TEST.map(
				(query) =>
					({
						code: `// async queries without await operator or then method are not valid
      import { render } from '${testingFramework}'

      test("An example test", async () => {
        doSomething()
        const foo = ${query}('foo')
      });
      `,
						errors: [{ messageId: 'awaitAsyncQuery', line: 6, column: 21 }],
					} as const)
			)
		),
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map(
			(query) =>
				({
					code: `// async screen queries without await operator or then method are not valid
      import { render } from '@testing-library/react'

      test("An example test", async () => {
        screen.${query}('foo')
      });
      `,
					errors: [
						{
							messageId: 'awaitAsyncQuery',
							line: 5,
							column: 16,
							data: { name: query },
						},
					],
				} as const)
		),
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map(
			(query) =>
				({
					code: `
      import { render } from '@testing-library/react'

      test("An example test", async () => {
        doSomething()
        const foo = ${query}('foo')
      });
      `,
					errors: [
						{
							messageId: 'awaitAsyncQuery',
							line: 6,
							column: 21,
							data: { name: query },
						},
					],
				} as const)
		),
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map(
			(query) =>
				({
					code: `
      import { render } from '@testing-library/react'

      test("An example test", async () => {
        const foo = ${query}('foo')
        expect(foo).toBeInTheDocument()
        expect(foo).toHaveAttribute('src', 'bar');
      });
      `,
					errors: [
						{
							messageId: 'awaitAsyncQuery',
							line: 5,
							column: 21,
							data: { name: query },
						},
					],
				} as const)
		),

		// unresolved async queries are not valid (aggressive reporting)
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map(
			(query) =>
				({
					code: `
        import { render } from "another-library"

        test('An example test', async () => {
          const example = ${query}("my example")
        })
      `,
					errors: [{ messageId: 'awaitAsyncQuery', line: 5, column: 27 }],
				} as const)
		),

		// unhandled promise from async query function wrapper is invalid
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map(
			(query) =>
				({
					code: `
        function queryWrapper() {
          doSomethingElse();

          return screen.${query}('foo')
        }

        test("An invalid example test", () => {
          const element = queryWrapper()
        })

        test("An invalid example test", async () => {
          const element = await queryWrapper()
        })
      `,
					errors: [{ messageId: 'asyncQueryWrapper', line: 9, column: 27 }],
				} as const)
		),
		// unhandled promise from async query arrow function wrapper is invalid
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map(
			(query) =>
				({
					code: `
        const queryWrapper = () => {
          doSomethingElse();

          return ${query}('foo')
        }

        test("An invalid example test", () => {
          const element = queryWrapper()
        })

        test("An invalid example test", async () => {
          const element = await queryWrapper()
        })
      `,
					errors: [{ messageId: 'asyncQueryWrapper', line: 9, column: 27 }],
				} as const)
		),
		// unhandled promise implicitly returned from async query arrow function wrapper is invalid
		...ALL_ASYNC_COMBINATIONS_TO_TEST.map(
			(query) =>
				({
					code: `
        const queryWrapper = () => screen.${query}('foo')

        test("An invalid example test", () => {
          const element = queryWrapper()
        })

        test("An invalid example test", async () => {
          const element = await queryWrapper()
        })
      `,
					errors: [{ messageId: 'asyncQueryWrapper', line: 5, column: 27 }],
				} as const)
		),

		// unhandled promise from custom query matching custom-queries setting is invalid
		{
			settings: {
				'testing-library/custom-queries': ['ByIcon', 'getByComplexText'],
			},
			code: `
      test('An invalid example test', () => {
        const element = findByIcon('search')
      })
      `,
			errors: [{ messageId: 'awaitAsyncQuery', line: 3, column: 25 }],
		},

		{
			code: `// similar to issue #359 but forcing an error in no-awaited wrapper
      import { render, screen } from 'mocks/test-utils'
      import userEvent from '@testing-library/user-event'

      const testData = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'extremeSecret',
      }

      const selectors = {
        username: () => screen.findByRole('textbox', { name: /username/i }),
        email: () => screen.findByRole('textbox', { name: /e-mail/i }),
        password: () => screen.findByLabelText(/password/i),
      }

      test('this is a valid case', async () => {
        render(<SomeComponent />)
        userEvent.type(selectors.username(), testData.name) // <-- unhandled here
        userEvent.type(await selectors.email(), testData.email)
        userEvent.type(await selectors.password(), testData.password)
        // ...
      })
    `,
			errors: [{ messageId: 'asyncQueryWrapper', line: 19, column: 34 }],
		},
	],
});
