import { TSESLint } from '@typescript-eslint/utils';

import rule, {
	RULE_NAME,
	MessageIds,
	Options,
} from '../../../lib/rules/prefer-query-matchers';
import { ALL_QUERIES_METHODS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const getByQueries = ALL_QUERIES_METHODS.map((method) => `get${method}`);
const getAllByQueries = ALL_QUERIES_METHODS.map((method) => `getAll${method}`);
const queryByQueries = ALL_QUERIES_METHODS.map((method) => `query${method}`);
const queryAllByQueries = ALL_QUERIES_METHODS.map(
	(method) => `queryAll${method}`
);

type RuleValidTestCase = TSESLint.ValidTestCase<Options>;
type RuleInvalidTestCase = TSESLint.InvalidTestCase<MessageIds, Options>;

type AssertionFnParams = {
	query: string;
	matcher: string;
	includeDefaultOptionsCase?: boolean;
	options: Options;
};

const getValidAssertions = ({
	query,
	matcher,
	includeDefaultOptionsCase = true,
	options,
}: AssertionFnParams): RuleValidTestCase[] => {
	const code = `expect(${query}('Hello'))${matcher}`;
	const screenCode = `expect(screen.${query}('Hello'))${matcher}`;
	return [
		...(includeDefaultOptionsCase
			? [
					{
						name: `${code} with default options`,
						code,
					},
			  ]
			: []),
		{
			name: `${code} with provided options`,
			code,
			options,
		},
		{
			name: `${code} with no validEntries`,
			code,
			options: [{ validEntries: [] }],
		},
		...(includeDefaultOptionsCase
			? [
					{
						name: `${screenCode} with default options`,
						code,
					},
			  ]
			: []),
		{
			name: `${screenCode} with provided options`,
			code: screenCode,
			options,
		},
		{
			name: `${screenCode} with no validEntries`,
			code: screenCode,
			options: [{ validEntries: [] }],
		},
	];
};

const getInvalidAssertions = ({
	query,
	matcher,
	includeDefaultOptionsCase = true,
	options,
}: AssertionFnParams): RuleInvalidTestCase[] => {
	const code = `expect(${query}('Hello'))${matcher}`;
	const screenCode = `expect(screen.${query}('Hello'))${matcher}`;
	const messageId: MessageIds = 'wrongQueryForMatcher';
	const [
		{
			validEntries: [validEntry],
		},
	] = options;
	return [
		...(includeDefaultOptionsCase
			? [
					{
						name: `${code} with default options`,
						code,
						errors: [
							{
								messageId,
								line: 1,
								column: 8,
								data: { query: validEntry.query, matcher: validEntry.matcher },
							},
						],
					},
			  ]
			: []),
		{
			name: `${code} with provided options`,
			code,
			options,
			errors: [
				{
					messageId,
					line: 1,
					column: 8,
					data: { query: validEntry.query, matcher: validEntry.matcher },
				},
			],
		},
		...(includeDefaultOptionsCase
			? [
					{
						name: `${screenCode} with default options`,
						code: screenCode,
						errors: [
							{
								messageId,
								line: 1,
								column: 15,
								data: { query: validEntry.query, matcher: validEntry.matcher },
							},
						],
					},
			  ]
			: []),
		{
			name: `${screenCode} with provided options`,
			code: screenCode,
			options,
			errors: [
				{
					messageId,
					line: 1,
					column: 15,
					data: { query: validEntry.query, matcher: validEntry.matcher },
				},
			],
		},
	];
};

ruleTester.run(RULE_NAME, rule, {
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
					includeDefaultOptionsCase: false,
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					includeDefaultOptionsCase: false,
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeVisible()',
					includeDefaultOptionsCase: false,
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeHelloWorld()',
					includeDefaultOptionsCase: false,
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
					includeDefaultOptionsCase: false,
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeHelloWorld()',
					includeDefaultOptionsCase: false,
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeVisible()',
					includeDefaultOptionsCase: false,
					options: [
						{ validEntries: [{ query: 'query', matcher: 'toBeVisible' }] },
					],
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeHelloWorld()',
					includeDefaultOptionsCase: false,
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
					includeDefaultOptionsCase: false,
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
					includeDefaultOptionsCase: false,
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
