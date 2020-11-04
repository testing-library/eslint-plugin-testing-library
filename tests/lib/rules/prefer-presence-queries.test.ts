import { createRuleTester } from '../test-utils';
import rule, {
  RULE_NAME,
  MessageIds,
} from '../../../lib/rules/prefer-presence-queries';
import { ALL_QUERIES_METHODS } from '../../../lib/utils';

const ruleTester = createRuleTester();

const getByQueries = ALL_QUERIES_METHODS.map((method) => `get${method}`);
const getAllByQueries = ALL_QUERIES_METHODS.map((method) => `getAll${method}`);
const queryByQueries = ALL_QUERIES_METHODS.map((method) => `query${method}`);
const queryAllByQueries = ALL_QUERIES_METHODS.map(
  (method) => `queryAll${method}`
);

type AssertionFnParams = {
  query: string;
  matcher: string;
  messageId: MessageIds;
  shouldUseScreen?: boolean;
};

const getValidAssertion = ({
  query,
  matcher,
  shouldUseScreen = false,
}: Omit<AssertionFnParams, 'messageId'>) => {
  const finalQuery = shouldUseScreen ? `screen.${query}` : query;
  return {
    code: `expect(${finalQuery}('Hello'))${matcher}`,
  };
};

const getInvalidAssertion = ({
  query,
  matcher,
  messageId,
  shouldUseScreen = false,
}: AssertionFnParams) => {
  const finalQuery = shouldUseScreen ? `screen.${query}` : query;
  return {
    code: `expect(${finalQuery}('Hello'))${matcher}`,
    errors: [{ messageId, line: 1, column: shouldUseScreen ? 15 : 8 }],
  };
};

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // cases: methods not matching Testing Library queries pattern
    `expect(queryElement('foo')).toBeInTheDocument()`,
    `expect(getElement('foo')).not.toBeInTheDocument()`,
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        // case: invalid presence assert but not reported because custom module is not imported
        expect(queryByRole('button')).toBeInTheDocument()
      `,
    },
    {
      settings: {
        'testing-library/module': 'test-utils',
      },
      code: `
        // case: invalid absence assert but not reported because custom module is not imported
        expect(getByRole('button')).not.toBeInTheDocument()
      `,
    },
    // cases: asserting presence correctly with `getBy*` queries
    ...getByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
        }),
        getValidAssertion({ query: queryName, matcher: '.toBeTruthy()' }),
        getValidAssertion({ query: queryName, matcher: '.toBeDefined()' }),
        getValidAssertion({ query: queryName, matcher: '.toBe("foo")' }),
        getValidAssertion({ query: queryName, matcher: '.toEqual("World")' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeFalsy()' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeNull()' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeDisabled()' }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
        }),
      ],
      []
    ),
    // cases: asserting presence correctly with `screen.getBy*` queries
    ...getByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBeTruthy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBeDefined()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBe("foo")',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toEqual("World")',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeFalsy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeNull()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeDisabled()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    // cases: asserting presence correctly with `getAllBy*` queries
    ...getAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
        }),
        getValidAssertion({ query: queryName, matcher: '.toBeTruthy()' }),
        getValidAssertion({ query: queryName, matcher: '.toBeDefined()' }),
        getValidAssertion({ query: queryName, matcher: '.toBe("foo")' }),
        getValidAssertion({ query: queryName, matcher: '.toEqual("World")' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeFalsy()' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeNull()' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeDisabled()' }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
        }),
      ],
      []
    ),
    // cases: asserting presence correctly with `screen.getAllBy*` queries
    ...getAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBeTruthy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBeDefined()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBe("foo")',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toEqual("World")',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeFalsy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeNull()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeDisabled()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    // cases: asserting absence correctly with `queryBy*` queries
    ...queryByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({ query: queryName, matcher: '.toBeNull()' }),
        getValidAssertion({ query: queryName, matcher: '.toBeFalsy()' }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
        }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeTruthy()' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeDefined()' }),
        getValidAssertion({ query: queryName, matcher: '.toEqual("World")' }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
        }),
      ],
      []
    ),
    // cases: asserting absence correctly with `screen.queryBy*` queries
    ...queryByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({
          query: queryName,
          matcher: '.toBeNull()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBeFalsy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeTruthy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeDefined()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toEqual("World")',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    // cases: asserting absence correctly with `queryAllBy*` queries
    ...queryAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({ query: queryName, matcher: '.toBeNull()' }),
        getValidAssertion({ query: queryName, matcher: '.toBeFalsy()' }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
        }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeTruthy()' }),
        getValidAssertion({ query: queryName, matcher: '.not.toBeDefined()' }),
        getValidAssertion({ query: queryName, matcher: '.toEqual("World")' }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
        }),
      ],
      []
    ),
    // cases: asserting absence correctly with `screen.queryAllBy*` queries
    ...queryAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getValidAssertion({
          query: queryName,
          matcher: '.toBeNull()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toBeFalsy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeTruthy()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toBeDefined()',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.toEqual("World")',
          shouldUseScreen: true,
        }),
        getValidAssertion({
          query: queryName,
          matcher: '.not.toHaveClass("btn")',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    {
      code: 'const el = getByText("button")',
    },
    {
      code: 'const el = queryByText("button")',
    },
    {
      // TODO: this one is gonna be reported by aggressive query reporting
      code:
        'expect(getByNonTestingLibraryQuery("button")).not.toBeInTheDocument()',
    },
    {
      // TODO: this one is gonna be reported by aggressive query reporting
      code:
        'expect(queryByNonTestingLibraryQuery("button")).toBeInTheDocument()',
    },
    {
      code: `async () => {
        const el = await findByText('button')
        expect(el).toBeInTheDocument()
      }`,
    },
    // some weird examples after here to check guard against parent nodes
    {
      code: 'expect(getByText("button")).not()',
    },
    {
      code: 'expect(queryByText("button")).not()',
    },
  ],
  invalid: [
    // cases: asserting absence incorrectly with `getBy*` queries
    ...getByQueries.reduce(
      (invalidRules, queryName) => [
        ...invalidRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeNull()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeFalsy()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeTruthy()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeDefined()',
          messageId: 'absenceQuery',
        }),
      ],
      []
    ),
    // cases: asserting absence incorrectly with `screen.getBy*` queries
    ...getByQueries.reduce(
      (invalidRules, queryName) => [
        ...invalidRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeNull()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeFalsy()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeTruthy()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeDefined()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    // cases: asserting absence incorrectly with `getAllBy*` queries
    ...getAllByQueries.reduce(
      (invalidRules, queryName) => [
        ...invalidRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeNull()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeFalsy()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeTruthy()',
          messageId: 'absenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeDefined()',
          messageId: 'absenceQuery',
        }),
      ],
      []
    ),
    // cases: asserting absence incorrectly with `screen.getAllBy*` queries
    ...getAllByQueries.reduce(
      (invalidRules, queryName) => [
        ...invalidRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeNull()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeFalsy()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeInTheDocument()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeTruthy()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeDefined()',
          messageId: 'absenceQuery',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    // cases: asserting presence incorrectly with `queryBy*` queries
    ...queryByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeTruthy()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeDefined()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeFalsy()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeNull()',
          messageId: 'presenceQuery',
        }),
      ],
      []
    ),
    // cases: asserting presence incorrectly with `screen.queryBy*` queries
    ...queryByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeTruthy()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeDefined()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeFalsy()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeNull()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    // cases: asserting presence incorrectly with `queryAllBy*` queries
    ...queryAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeTruthy()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeDefined()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeFalsy()',
          messageId: 'presenceQuery',
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeNull()',
          messageId: 'presenceQuery',
        }),
      ],
      []
    ),
    // cases: asserting presence incorrectly with `screen.queryAllBy*` queries
    ...queryAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeTruthy()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeDefined()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.toBeInTheDocument()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeFalsy()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
        getInvalidAssertion({
          query: queryName,
          matcher: '.not.toBeNull()',
          messageId: 'presenceQuery',
          shouldUseScreen: true,
        }),
      ],
      []
    ),
    {
      code: 'expect(screen.getAllByText("button")[1]).not.toBeInTheDocument()',
      errors: [{ messageId: 'absenceQuery', line: 1, column: 15 }],
    },
    {
      code: 'expect(screen.queryAllByText("button")[1]).toBeInTheDocument()',
      errors: [{ messageId: 'presenceQuery', line: 1, column: 15 }],
    },
    // TODO: add more tests for using custom queries
    // TODO: add more tests for importing custom module
  ],
});
