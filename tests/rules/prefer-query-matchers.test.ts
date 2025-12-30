import rule from '../../src/rules/prefer-query-matchers';
import { ALL_QUERIES_METHODS } from '../../src/utils';
import { createRuleTester } from '../test-utils';

import type {
	MessageIds,
	Options,
} from '../../src/rules/prefer-query-matchers';
import type {
	InvalidTestCase,
	ValidTestCase,
} from '@typescript-eslint/rule-tester';

const ruleTester = createRuleTester();

const getByQueries = ALL_QUERIES_METHODS.map((method) => `get${method}`);
const getAllByQueries = ALL_QUERIES_METHODS.map((method) => `getAll${method}`);
const queryByQueries = ALL_QUERIES_METHODS.map((method) => `query${method}`);
const queryAllByQueries = ALL_QUERIES_METHODS.map(
	(method) => `queryAll${method}`
);

type RuleValidTestCase = ValidTestCase<Options>;
type RuleInvalidTestCase = InvalidTestCase<MessageIds, Options>;

type AssertionFnParams = {
	query: string;
	matcher: string;
	options: Options;
	onlyOptions?: boolean;
};

const wrapExpectInTest = (expectStatement: string) => `
import { render, screen } from '@testing-library/react'

test('a fake test', () => {
  render(<Component />)

  ${expectStatement}
})`;

const getValidAssertions = ({
	query,
	matcher,
	options,
	onlyOptions = false,
}: AssertionFnParams): RuleValidTestCase[] => {
	const expectStatement = `expect(${query}('Hello'))${matcher}`;
	const expectScreenStatement = `expect(screen.${query}('Hello'))${matcher}`;
	const casesWithOptions = [
		{
			// name: `${expectStatement} with provided options`,
			code: wrapExpectInTest(expectStatement),
			options,
		},
		{
			// name: `${expectScreenStatement} with provided options`,
			code: wrapExpectInTest(expectScreenStatement),
			options,
		},
	];

	if (onlyOptions) {
		return casesWithOptions;
	}

	return [
		{
			// name: `${expectStatement} with default options of empty validEntries`,
			code: wrapExpectInTest(expectStatement),
		},
		{
			// name: `${expectScreenStatement} with default options of empty validEntries`,
			code: wrapExpectInTest(expectScreenStatement),
		},
		...casesWithOptions,
	];
};

const getInvalidAssertions = ({
	query,
	matcher,
	options,
}: AssertionFnParams): RuleInvalidTestCase[] => {
	const expectStatement = `expect(${query}('Hello'))${matcher}`;
	const expectScreenStatement = `expect(screen.${query}('Hello'))${matcher}`;
	const messageId: MessageIds = 'wrongQueryForMatcher';
	const [
		{
			validEntries: [validEntry],
		},
	] = options;
	return [
		{
			// name: `${expectStatement} with provided options`,
			code: wrapExpectInTest(expectStatement),
			options,
			errors: [
				{
					messageId,
					line: 7,
					column: 10,
					data: { query: validEntry?.query, matcher: validEntry?.matcher },
				},
			],
		},
		{
			// name: `${expectScreenStatement} with provided options`,
			code: wrapExpectInTest(expectScreenStatement),
			options,
			errors: [
				{
					messageId,
					line: 7,
					column: 17,
					data: { query: validEntry?.query, matcher: validEntry?.matcher },
				},
			],
		},
	];
};

ruleTester.run(rule.name, rule, {
	valid: [
		// cases: methods not matching Testing Library queries pattern
		`expect(queryElement('foo')).toBeVisible()`,
		`expect(getElement('foo')).not.toBeVisible()`,
		// cases: asserting with a configured allowed `[screen.]getBy*` query
		...getByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
					onlyOptions: true,
				}),
			],
			[]
		),
		// cases: asserting with a configured allowed `[screen.]getAllBy*` query
		...getAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
					onlyOptions: true,
				}),
			],
			[]
		),
		// cases: asserting with a configured allowed `[screen.]queryBy*` query
		...queryByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
					onlyOptions: true,
				}),
			],
			[]
		),
		// cases: asserting with a configured allowed `[screen.]queryAllBy*` query
		...queryAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
					onlyOptions: true,
				}),
			],
			[]
		),
		// case: getting outside an expectation
		{
			code: 'const el = getByText("button")',
		},
		// case: querying outside an expectation
		{
			code: 'const el = queryByText("button")',
		},
		// case: finding outside an expectation
		{
			code: `async () => {
        const el = await findByText('button')
        expect(el).toBeVisible()
      }`,
		},
		{
			code: `// case: query an element with getBy but then check its absence after doing
			// some action which makes it disappear.

			// submit button exists
			const submitButton = screen.getByRole('button')
			fireEvent.click(submitButton)

			// right after clicking submit button it disappears
			expect(submitButton).toBeHelloWorld()
			`,
			options: [
				{ validEntries: [{ query: 'query', matcher: 'toBeHelloWorld' }] },
			],
		},
	],
	invalid: [
		// cases: asserting with a disallowed `[screen.]getBy*` query
		...getByQueries.reduce<RuleInvalidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeHelloWorld' }] },
					],
				}),
			],
			[]
		),
		// cases: asserting with a disallowed `[screen.]getAllBy*` query
		...getAllByQueries.reduce<RuleInvalidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeHelloWorld' }] },
					],
				}),
			],
			[]
		),
		// cases: asserting with a disallowed `[screen.]getBy*` query
		...queryByQueries.reduce<RuleInvalidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
			],
			[]
		),
		// cases: asserting with a disallowed `[screen.]queryAllBy*` query
		...queryAllByQueries.reduce<RuleInvalidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeVisible()',
					options: [
						{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] },
					],
				}),
			],
			[]
		),
		// cases: indexing into an `AllBy` result within the expectation
		{
			code: 'expect(screen.queryAllByText("button")[1]).toBeVisible()',
			options: [{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] }],
			errors: [
				{
					messageId: 'wrongQueryForMatcher',
					line: 1,
					column: 15,
					data: { query: 'get', matcher: 'toBeVisible' },
				},
			],
		},
		{
			code: `
				// case: asserting presence incorrectly with custom queryBy* query
				expect(queryByCustomQuery("button")).toBeVisible()
		  `,
			options: [{ validEntries: [{ query: 'get', matcher: 'toBeVisible' }] }],
			errors: [
				{
					messageId: 'wrongQueryForMatcher',
					line: 3,
					column: 12,
					data: { query: 'get', matcher: 'toBeVisible' },
				},
			],
		},
	],
});
