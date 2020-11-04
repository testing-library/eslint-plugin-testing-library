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

const allQueryUseInAssertion = (queryName: string) => [
  queryName,
  `screen.${queryName}`,
];

const getValidAssertion = (query: string, matcher: string) =>
  allQueryUseInAssertion(query).map((query) => ({
    code: `expect(${query}('Hello'))${matcher}`,
  }));

const getInvalidAssertion = (
  query: string,
  matcher: string,
  messageId: MessageIds
) =>
  allQueryUseInAssertion(query).map((query) => ({
    code: `expect(${query}('Hello'))${matcher}`,
    // TODO: column can't be checked as queries are generated with and without `screen` prefix
    //  so this must be generated in a different way to be able to check error column.
    errors: [{ messageId, line: 1 }],
  }));

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...getByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        ...getValidAssertion(queryName, '.toBeInTheDocument()'),
        ...getValidAssertion(queryName, '.toBeTruthy()'),
        ...getValidAssertion(queryName, '.toBeDefined()'),
        ...getValidAssertion(queryName, '.toBe("foo")'),
        ...getValidAssertion(queryName, '.toEqual("World")'),
        ...getValidAssertion(queryName, '.not.toBeFalsy()'),
        ...getValidAssertion(queryName, '.not.toBeNull()'),
        ...getValidAssertion(queryName, '.not.toBeDisabled()'),
        ...getValidAssertion(queryName, '.not.toHaveClass("btn")'),
      ],
      []
    ),
    ...getAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        ...getValidAssertion(queryName, '.toBeInTheDocument()'),
        ...getValidAssertion(queryName, '.toBeTruthy()'),
        ...getValidAssertion(queryName, '.toBeDefined()'),
        ...getValidAssertion(queryName, '.toBe("foo")'),
        ...getValidAssertion(queryName, '.toEqual("World")'),
        ...getValidAssertion(queryName, '.not.toBeFalsy()'),
        ...getValidAssertion(queryName, '.not.toBeNull()'),
        ...getValidAssertion(queryName, '.not.toBeDisabled()'),
        ...getValidAssertion(queryName, '.not.toHaveClass("btn")'),
      ],
      []
    ),
    ...queryByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        ...getValidAssertion(queryName, '.toBeNull()'),
        ...getValidAssertion(queryName, '.toBeFalsy()'),
        ...getValidAssertion(queryName, '.not.toBeInTheDocument()'),
        ...getValidAssertion(queryName, '.not.toBeTruthy()'),
        ...getValidAssertion(queryName, '.not.toBeDefined()'),
        ...getValidAssertion(queryName, '.toEqual("World")'),
        ...getValidAssertion(queryName, '.not.toHaveClass("btn")'),
      ],
      []
    ),
    ...queryAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        ...getValidAssertion(queryName, '.toBeNull()'),
        ...getValidAssertion(queryName, '.toBeFalsy()'),
        ...getValidAssertion(queryName, '.not.toBeInTheDocument()'),
        ...getValidAssertion(queryName, '.not.toBeTruthy()'),
        ...getValidAssertion(queryName, '.not.toBeDefined()'),
        ...getValidAssertion(queryName, '.toEqual("World")'),
        ...getValidAssertion(queryName, '.not.toHaveClass("btn")'),
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
      code:
        'expect(getByNonTestingLibraryQuery("button")).not.toBeInTheDocument()',
    },
    {
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
    ...getByQueries.reduce(
      (invalidRules, queryName) => [
        ...invalidRules,
        ...getInvalidAssertion(queryName, '.toBeNull()', 'absenceQuery'),
        ...getInvalidAssertion(queryName, '.toBeFalsy()', 'absenceQuery'),
        ...getInvalidAssertion(
          queryName,
          '.not.toBeInTheDocument()',
          'absenceQuery'
        ),
        ...getInvalidAssertion(queryName, '.not.toBeTruthy()', 'absenceQuery'),
        ...getInvalidAssertion(queryName, '.not.toBeDefined()', 'absenceQuery'),
      ],
      []
    ),
    ...getAllByQueries.reduce(
      (invalidRules, queryName) => [
        ...invalidRules,
        ...getInvalidAssertion(queryName, '.toBeNull()', 'absenceQuery'),
        ...getInvalidAssertion(queryName, '.toBeFalsy()', 'absenceQuery'),
        ...getInvalidAssertion(
          queryName,
          '.not.toBeInTheDocument()',
          'absenceQuery'
        ),
        ...getInvalidAssertion(queryName, '.not.toBeTruthy()', 'absenceQuery'),
        ...getInvalidAssertion(queryName, '.not.toBeDefined()', 'absenceQuery'),
      ],
      []
    ),
    {
      // TODO: improve this case to get error on `queryAllByText` rather than `screen`
      code: 'expect(screen.getAllByText("button")[1]).not.toBeInTheDocument()',
      errors: [{ messageId: 'absenceQuery', line: 1, column: 15 }],
    },
    ...queryByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        ...getInvalidAssertion(queryName, '.toBeTruthy()', 'presenceQuery'),
        ...getInvalidAssertion(queryName, '.toBeDefined()', 'presenceQuery'),
        ...getInvalidAssertion(
          queryName,
          '.toBeInTheDocument()',
          'presenceQuery'
        ),
        ...getInvalidAssertion(queryName, '.not.toBeFalsy()', 'presenceQuery'),
        ...getInvalidAssertion(queryName, '.not.toBeNull()', 'presenceQuery'),
      ],
      []
    ),
    ...queryAllByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        ...getInvalidAssertion(queryName, '.toBeTruthy()', 'presenceQuery'),
        ...getInvalidAssertion(queryName, '.toBeDefined()', 'presenceQuery'),
        ...getInvalidAssertion(
          queryName,
          '.toBeInTheDocument()',
          'presenceQuery'
        ),
        ...getInvalidAssertion(queryName, '.not.toBeFalsy()', 'presenceQuery'),
        ...getInvalidAssertion(queryName, '.not.toBeNull()', 'presenceQuery'),
      ],
      []
    ),
    {
      // TODO: improve this case to get error on `queryAllByText` rather than `screen`
      code: 'expect(screen.queryAllByText("button")[1]).toBeInTheDocument()',
      errors: [{ messageId: 'presenceQuery', line: 1, column: 15 }],
    },
    // TODO: add more tests for custom queries
  ],
});
