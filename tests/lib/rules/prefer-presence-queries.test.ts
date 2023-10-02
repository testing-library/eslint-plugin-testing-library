import { TSESLint } from '@typescript-eslint/utils';

import rule, {
	RULE_NAME,
	MessageIds,
	Options,
} from '../../../lib/rules/prefer-presence-queries';
import { ALL_QUERIES_METHODS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const getByQueries = ALL_QUERIES_METHODS.map((method) => `get${method}`);
const getAllByQueries = ALL_QUERIES_METHODS.map((method) => `getAll${method}`);
const queryByQueries = ALL_QUERIES_METHODS.map((method) => `query${method}`);
const queryAllByQueries = ALL_QUERIES_METHODS.map(
	(method) => `queryAll${method}`,
);

type RuleValidTestCase = TSESLint.ValidTestCase<Options>;
type RuleInvalidTestCase = TSESLint.InvalidTestCase<MessageIds, Options>;

type AssertionFnParams = {
	query: string;
	matcher: string;
	messageId: MessageIds;
	shouldUseScreen?: boolean;
	assertionType: keyof Options[number];
};

const getValidAssertions = ({
	query,
	matcher,
	shouldUseScreen = false,
	assertionType,
}: Omit<AssertionFnParams, 'messageId'>): RuleValidTestCase[] => {
	const finalQuery = shouldUseScreen ? `screen.${query}` : query;
	const code = `expect(${finalQuery}('Hello'))${matcher}`;
	return [
		{
			code,
		},
		{
			code,
			options: [
				{
					[assertionType]: true,
					[assertionType === 'absence' ? 'presence' : 'absence']: false,
				},
			],
		},
		{
			code,
			options: [
				{
					presence: false,
					absence: false,
				},
			],
		},
	];
};

const getDisabledValidAssertion = ({
	query,
	matcher,
	shouldUseScreen = false,
	assertionType,
}: Omit<AssertionFnParams, 'messageId'>): RuleValidTestCase => {
	const finalQuery = shouldUseScreen ? `screen.${query}` : query;
	return {
		code: `expect(${finalQuery}('Hello'))${matcher}`,
		options: [
			{
				[assertionType]: false,
				[assertionType === 'absence' ? 'presence' : 'absence']: true,
			},
		],
	};
};

const getInvalidAssertions = ({
	query,
	matcher,
	messageId,
	shouldUseScreen = false,
	assertionType,
}: AssertionFnParams): RuleInvalidTestCase[] => {
	const finalQuery = shouldUseScreen ? `screen.${query}` : query;
	const code = `expect(${finalQuery}('Hello'))${matcher}`;
	return [
		{
			code,
			errors: [{ messageId, line: 1, column: shouldUseScreen ? 15 : 8 }],
		},
		{
			code,
			options: [
				{
					[assertionType]: true,
					[assertionType === 'absence' ? 'presence' : 'absence']: false,
				},
			],
			errors: [{ messageId, line: 1, column: shouldUseScreen ? 15 : 8 }],
		},
	];
};

ruleTester.run(RULE_NAME, rule, {
	valid: [
		// cases: methods not matching Testing Library queries pattern
		`expect(queryElement('foo')).toBeInTheDocument()`,
		`expect(getElement('foo')).not.toBeInTheDocument()`,
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        // case: invalid presence assert but not reported because custom module is not imported
        expect(queryByRole('button')).toBeInTheDocument()
      `,
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        // case: invalid absence assert but not reported because custom module is not imported
        expect(getByRole('button')).not.toBeInTheDocument()
      `,
		},
		// cases: asserting presence correctly with `getBy*` queries
		...getByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBe("foo")',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDisabled()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence correctly with `screen.getBy*` queries
		...getByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBe("foo")',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDisabled()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence correctly with `getAllBy*` queries
		...getAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBe("foo")',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDisabled()',
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence correctly with `screen.getAllBy*` queries
		...getAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBe("foo")',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDisabled()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting absence correctly with `queryBy*` queries
		...queryByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence correctly with `screen.queryBy*` queries
		...queryByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence correctly with `queryAllBy*` queries
		...queryAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence correctly with `screen.queryAllBy*` queries
		...queryAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.toEqual("World")',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getValidAssertions({
					query: queryName,
					matcher: '.not.toHaveClass("btn")',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
			],
			[],
		),

		// cases: asserting absence incorrectly with `getBy*` queries with absence rule disabled
		...getByQueries.reduce<RuleValidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeNull()',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeFalsy()',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeInTheDocument',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeDefined()',
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence incorrectly with `screen.getBy*` queries with absence rule disabled
		...getByQueries.reduce<RuleValidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeInTheDocument',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence incorrectly with `getAllBy*` queries with absence rule disabled
		...getAllByQueries.reduce<RuleValidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeNull()',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeFalsy()',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeInTheDocument',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeDefined()',
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence incorrectly with `screen.getAllBy*` queries with absence rule disabled
		...getAllByQueries.reduce<RuleValidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeInTheDocument',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `queryBy*` queries with presence rule disabled
		...queryByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeTruthy()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeDefined()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeNull()',
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `screen.queryBy*` queries with presence rule disabled
		...queryByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `queryAllBy*` queries with presence rule disabled
		...queryAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeTruthy()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeDefined()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeNull()',
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `screen.queryAllBy*` queries with presence rule disabled
		...queryAllByQueries.reduce<RuleValidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeTruthy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeDefined()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				getDisabledValidAssertion({
					query: queryName,
					matcher: '.not.toBeNull()',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
			],
			[],
		),

		{
			code: 'const el = getByText("button")',
		},
		{
			code: 'const el = queryByText("button")',
		},
		{
			code: `async () => {
        const el = await findByText('button')
        expect(el).toBeInTheDocument()
      }`,
		},
		`// case: query an element with getBy but then check its absence after doing
     // some action which makes it disappear.

     // submit button exists
     const submitButton = screen.getByRole('button')
     fireEvent.click(submitButton)
    
     // right after clicking submit button it disappears
     expect(submitButton).not.toBeInTheDocument()
    `,
		`// checking absence on getBy* inside a within with queryBy* outside the within
	 expect(within(screen.getByRole("button")).queryByText("Hello")).not.toBeInTheDocument()
	`,
		`// checking presence on getBy* inside a within with getBy* outside the within
	 expect(within(screen.getByRole("button")).getByText("Hello")).toBeInTheDocument()
	`,
	],
	invalid: [
		// cases: asserting absence incorrectly with `getBy*` queries
		...getByQueries.reduce<RuleInvalidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence incorrectly with `screen.getBy*` queries
		...getByQueries.reduce<RuleInvalidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence incorrectly with `getAllBy*` queries
		...getAllByQueries.reduce<RuleInvalidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					messageId: 'wrongAbsenceQuery',
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting absence incorrectly with `screen.getAllBy*` queries
		...getAllByQueries.reduce<RuleInvalidTestCase[]>(
			(invalidRules, queryName) => [
				...invalidRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeNull()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeFalsy()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeInTheDocument()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeTruthy()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeDefined()',
					messageId: 'wrongAbsenceQuery',
					shouldUseScreen: true,
					assertionType: 'absence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `queryBy*` queries
		...queryByQueries.reduce<RuleInvalidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `screen.queryBy*` queries
		...queryByQueries.reduce<RuleInvalidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `queryAllBy*` queries
		...queryAllByQueries.reduce<RuleInvalidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					messageId: 'wrongPresenceQuery',
					assertionType: 'presence',
				}),
			],
			[],
		),
		// cases: asserting presence incorrectly with `screen.queryAllBy*` queries
		...queryAllByQueries.reduce<RuleInvalidTestCase[]>(
			(validRules, queryName) => [
				...validRules,
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeTruthy()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeDefined()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.toBeInTheDocument()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeFalsy()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
				...getInvalidAssertions({
					query: queryName,
					matcher: '.not.toBeNull()',
					messageId: 'wrongPresenceQuery',
					shouldUseScreen: true,
					assertionType: 'presence',
				}),
			],
			[],
		),
		{
			code: 'expect(screen.getAllByText("button")[1]).not.toBeInTheDocument()',
			errors: [{ messageId: 'wrongAbsenceQuery', line: 1, column: 15 }],
		},
		{
			code: 'expect(screen.queryAllByText("button")[1]).toBeInTheDocument()',
			errors: [{ messageId: 'wrongPresenceQuery', line: 1, column: 15 }],
		},
		{
			code: `
      // case: asserting presence incorrectly with custom queryBy* query
        expect(queryByCustomQuery("button")).toBeInTheDocument()
      `,
			errors: [{ messageId: 'wrongPresenceQuery', line: 3, column: 16 }],
		},
		{
			code: `
        // case: asserting absence incorrectly with custom getBy* query
        expect(getByCustomQuery("button")).not.toBeInTheDocument()
      `,
			errors: [{ messageId: 'wrongAbsenceQuery', line: 3, column: 16 }],
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      // case: asserting presence incorrectly importing custom module
      import 'test-utils'
      expect(queryByRole("button")).toBeInTheDocument()
      `,
			errors: [{ line: 4, column: 14, messageId: 'wrongPresenceQuery' }],
		},
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      // case: asserting absence incorrectly importing custom module
      import 'test-utils'
      expect(getByRole("button")).not.toBeInTheDocument()
      `,
			errors: [{ line: 4, column: 14, messageId: 'wrongAbsenceQuery' }],
		},
		{
			code: `
	  // case: asserting within check does still work with improper outer clause
	  expect(within(screen.getByRole("button")).getByText("Hello")).not.toBeInTheDocument()`,
			errors: [{ line: 3, column: 46, messageId: 'wrongAbsenceQuery' }],
		},
		{
			code: `
	  // case: asserting within check does still work with improper outer clause
	  expect(within(screen.getByRole("button")).queryByText("Hello")).toBeInTheDocument()`,
			errors: [{ line: 3, column: 46, messageId: 'wrongPresenceQuery' }],
		},
		{
			code: `
	  // case: asserting within check does still work with improper outer clause and improper inner clause
	  expect(within(screen.queryByRole("button")).getByText("Hello")).not.toBeInTheDocument()`,
			errors: [
				{ line: 3, column: 25, messageId: 'wrongPresenceQuery' },
				{ line: 3, column: 48, messageId: 'wrongAbsenceQuery' },
			],
		},
		{
			code: `
	  // case: asserting within check does still work with proper outer clause and improper inner clause
	  expect(within(screen.queryByRole("button")).queryByText("Hello")).not.toBeInTheDocument()`,
			errors: [{ line: 3, column: 25, messageId: 'wrongPresenceQuery' }],
		},
		{
			code: `
	  // case: asserting within check does still work with proper outer clause and improper inner clause
	  expect(within(screen.queryByRole("button")).getByText("Hello")).toBeInTheDocument()`,
			errors: [{ line: 3, column: 25, messageId: 'wrongPresenceQuery' }],
		},
		{
			code: `
	  // case: asserting within check does still work with improper outer clause and improper inner clause
	  expect(within(screen.queryByRole("button")).queryByText("Hello")).toBeInTheDocument()`,
			errors: [
				{ line: 3, column: 25, messageId: 'wrongPresenceQuery' },
				{ line: 3, column: 48, messageId: 'wrongPresenceQuery' },
			],
		},
	],
});
