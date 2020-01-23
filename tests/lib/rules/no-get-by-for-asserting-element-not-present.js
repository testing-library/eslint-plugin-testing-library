'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/no-get-by-for-asserting-element-not-present');
const { ALL_QUERIES_METHODS } = require('../../../lib/utils');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2017, sourceType: 'module' },
});

const getByVariants = ALL_QUERIES_METHODS.reduce(
  (variants, method) => [...variants, ...[`get${method}`, `getAll${method}`]],
  []
);

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

ruleTester.run('prefer-expect-query-by', rule, {
  valid: getByVariants.reduce(
    (validRules, queryName) => [
      ...validRules,
      ...getValidAssertion(queryName, '.toBeInTheDocument()'),
      ...getValidAssertion(queryName, '.toBe("foo")'),
      ...getValidAssertion(queryName, '.toBeTruthy()'),
      ...getValidAssertion(queryName, '.toEqual("World")'),
      ...getValidAssertion(queryName, '.not.toBeFalsy()'),
    ],
    []
  ),
  invalid: getByVariants.reduce(
    (invalidRules, queryName) => [
      ...invalidRules,
      ...getInvalidAssertion(queryName, '.not.toBeInTheDocument()'),
      ...getInvalidAssertion(queryName, '.toBeNull()'),
      ...getInvalidAssertion(queryName, '.not.toBeTruthy()'),
      ...getInvalidAssertion(queryName, '.toBeUndefined()'),
      ...getInvalidAssertion(queryName, '.toBeFalsy()'),
      {
        code: `(async () => {
          await waitForElementToBeRemoved(() => {
            return ${queryName}("hello")
          })
        })()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
    ],
    []
  ),
});
