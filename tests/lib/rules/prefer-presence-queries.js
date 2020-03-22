'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/prefer-presence-queries');
const { ALL_QUERIES_METHODS } = require('../../../lib/utils');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2017, sourceType: 'module' },
});

const getByQueries = ALL_QUERIES_METHODS.map(method => `get${method}`);
const queryByQueries = ALL_QUERIES_METHODS.map(method => `query${method}`);

const allQueryUseInAssertion = queryName => [
  queryName,
  `rendered.${queryName}`,
];

const getValidAssertion = (query, matcher) =>
  allQueryUseInAssertion(query).map(query => ({
    code: `expect(${query}('Hello'))${matcher}`,
  }));

const getInvalidAssertion = (query, matcher) =>
  allQueryUseInAssertion(query).map(query => ({
    code: `expect(${query}('Hello'))${matcher}`,
    errors: [{ messageId: 'expectQueryBy' }],
  }));

ruleTester.run('prefer-presence-queries', rule, {
  valid: [
    ...getByQueries.reduce(
      (validRules, queryName) => [
        ...validRules,
        ...getValidAssertion(queryName, '.toBeInTheDocument()'),
        ...getValidAssertion(queryName, '.toBe("foo")'),
        ...getValidAssertion(queryName, '.toBeTruthy()'),
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
        ...getValidAssertion(queryName, '.not.toBeInTheDocument()'),
        ...getValidAssertion(queryName, '.toBeNull()'),
        ...getValidAssertion(queryName, '.not.toBeTruthy()'),
        ...getValidAssertion(queryName, '.not.toBeDefined()'),
        ...getValidAssertion(queryName, '.toBeFalsy()'),
        {
          code: `(async () => {
            await waitForElementToBeRemoved(() => {
              return ${queryName}("hello")
            })
          })()`,
        },
        {
          code: `(async () => {
            await waitForElementToBeRemoved(() =>  ${queryName}("hello"))
          })()`,
        },
        {
          code: `(async () => {
            await waitForElementToBeRemoved(function() {
              return ${queryName}("hello")
            })
          })()`,
        },
      ],
      []
    ),
  ],
  invalid: getByQueries.reduce(
    (invalidRules, queryName) => [
      ...invalidRules,
      ...getInvalidAssertion(queryName, '.not.toBeInTheDocument()'),
      ...getInvalidAssertion(queryName, '.toBeNull()'),
      ...getInvalidAssertion(queryName, '.not.toBeTruthy()'),
      ...getInvalidAssertion(queryName, '.not.toBeDefined()'),
      ...getInvalidAssertion(queryName, '.toBeFalsy()'),
      {
        code: `(async () => {
          await waitForElementToBeRemoved(() => {
            return ${queryName}("hello")
          })
        })()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `(async () => {
          await waitForElementToBeRemoved(() =>  ${queryName}("hello"))
        })()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `(async () => {
          await waitForElementToBeRemoved(function() {
            return ${queryName}("hello")
          })
        })()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
    ],
    []
  ),
});
