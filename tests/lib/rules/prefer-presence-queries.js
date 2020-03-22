'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/prefer-presence-queries');
const { ALL_QUERIES_METHODS } = require('../../../lib/utils');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2017, sourceType: 'module' },
});

const getByQueries = ALL_QUERIES_METHODS.map(method => `get${method}`);
const queryByQueries = ALL_QUERIES_METHODS.map(method => `query${method}`);

const allQueryUseInAssertion = queryName => [queryName, `screen.${queryName}`];

const getValidAssertion = (query, matcher) =>
  allQueryUseInAssertion(query).map(query => ({
    code: `expect(${query}('Hello'))${matcher}`,
  }));

const getInvalidAssertion = (query, matcher, messageId) =>
  allQueryUseInAssertion(query).map(query => ({
    code: `expect(${query}('Hello'))${matcher}`,
    errors: [{ messageId }],
  }));

ruleTester.run('prefer-presence-queries', rule, {
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
    {
      code: 'const el = getByText("button")',
    },
    {
      code: 'const el = queryByText("button")',
    },
    {
      code: 'expect(getAllByText("button")).not.toBeInTheDocument()',
    },
    {
      code: 'expect(queryAllByText("button")).toBeInTheDocument()',
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
  ],
});
