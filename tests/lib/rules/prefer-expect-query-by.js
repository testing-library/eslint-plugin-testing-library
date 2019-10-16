'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/prefer-expect-query-by');
const { ALL_QUERIES_METHODS } = require('../../../lib/utils');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
});

const queryByVariants = ALL_QUERIES_METHODS.reduce(
  (variants, method) => [
    ...variants,
    ...[`query${method}`, `queryAll${method}`],
  ],
  []
);
const getByVariants = ALL_QUERIES_METHODS.reduce(
  (variants, method) => [...variants, ...[`get${method}`, `getAll${method}`]],
  []
);

ruleTester.run('prefer-expect-query-by', rule, {
  valid: queryByVariants.reduce(
    (validRules, queryName) => [
      ...validRules,
      { code: `expect(${queryName}('Hello')).toBeInTheDocument()` },
      { code: `expect(rendered.${queryName}('Hello')).toBeInTheDocument()` },
      { code: `expect(${queryName}('Hello')).not.toBeInTheDocument()` },
      {
        code: `expect(rendered.${queryName}('Hello')).not.toBeInTheDocument()`,
      },
    ],
    []
  ),
  invalid: getByVariants.reduce(
    (invalidRules, queryName) => [
      ...invalidRules,
      {
        code: `expect(${queryName}('Hello')).toBeInTheDocument()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(rendered.${queryName}('Hello')).toBeInTheDocument()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(${queryName}('Hello')).not.toBeInTheDocument()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
      {
        code: `expect(rendered.${queryName}('Hello')).not.toBeInTheDocument()`,
        errors: [{ messageId: 'expectQueryBy' }],
      },
    ],
    []
  ),
});
