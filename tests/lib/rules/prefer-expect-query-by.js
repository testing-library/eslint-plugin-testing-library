'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/prefer-expect-query-by');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
});

ruleTester.run('prefer-expect-query-by', rule, {
  valid: [
    { code: "expect(queryByText('Hello')).not.toBeInTheDocument()" },
    { code: "expect(rendered.queryByText('Hello')).not.toBeInTheDocument()" },
    { code: "expect(queryAllByText('Hello')).not.toBeInTheDocument()" },
    {
      code: "expect(rendered.queryAllByText('Hello')).not.toBeInTheDocument()",
    },
  ],
  invalid: [
    {
      code: "expect(getByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
    },
    {
      code: "expect(rendered.getByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
    },
    {
      code: "expect(getAllByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
    },
    {
      code: "expect(rendered.getAllByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
    },
  ],
});
