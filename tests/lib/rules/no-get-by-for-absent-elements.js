'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/no-get-by-for-absent-elements');
const { ALL_QUERIES_METHODS } = require('../../../lib/utils');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2017, sourceType: 'module' },
});

const getByVariants = ALL_QUERIES_METHODS.reduce(
  (variants, method) => [...variants, ...[`get${method}`, `getAll${method}`]],
  []
);

ruleTester.run('prefer-expect-query-by', rule, {
  valid: getByVariants.reduce(
    (validRules, queryName) => [
      ...validRules,
      { code: `expect(${queryName}('Hello')).toBeInTheDocument()` },
      { code: `expect(${queryName}('Hello')).toBe("foo")` },
      { code: `expect(${queryName}('Hello')).toBeTruthy()` },
      { code: `expect(rendered.${queryName}('Hello')).toEqual("World")` },
      { code: `expect(rendered.${queryName}('Hello')).not.toBeFalsy()` },
    ],
    []
  ),
  invalid: getByVariants.reduce(
    (invalidRules, queryName) => [
      ...invalidRules,
      {
        code: `expect(${queryName}('Hello')).not.toBeInTheDocument()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(${queryName}('Hello')).toBeNull()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(${queryName}('Hello')).not.toBeTruthy()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(${queryName}('Hello')).toBeUndefined()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(${queryName}('Hello')).toBeFalsy()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(rendered.${queryName}('Hello')).toBeFalsy()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(rendered.${queryName}('Hello')).not.toBeTruthy()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `(async () => {
          await waitForElementToBeRemoved(() => {
            return getByText("hello")
          })
        })()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
    ],
    []
  ),
});
