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
    { code: "expect(queryByText('Hello')).toBeInTheDocument()" },
    { code: "expect(rendered.queryByText('Hello')).toBeInTheDocument()" },
    { code: "expect(queryAllByText('Hello')).toBeInTheDocument()" },
    {
      code: "expect(rendered.queryAllByText('Hello')).toBeInTheDocument()",
    },
  ],
  invalid: [
    {
      code: "expect(getByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(queryByText('Hello')).not.toBeInTheDocument()",
    },
    {
      code: "expect(rendered.getByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(rendered.queryByText('Hello')).not.toBeInTheDocument()",
    },
    {
      code: "expect(getAllByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(queryAllByText('Hello')).not.toBeInTheDocument()",
    },
    {
      code: "expect(rendered.getAllByText('Hello')).not.toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output:
        "expect(rendered.queryAllByText('Hello')).not.toBeInTheDocument()",
    },
    {
      code: "expect(getByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(queryByText('Hello')).toBeInTheDocument()",
    },
    {
      code: "expect(rendered.getByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(rendered.queryByText('Hello')).toBeInTheDocument()",
    },
    {
      code: "expect(getAllByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(queryAllByText('Hello')).toBeInTheDocument()",
    },
    {
      code: "expect(rendered.getAllByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(rendered.queryAllByText('Hello')).toBeInTheDocument()",
    },
    {
      code: "expect(findByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(queryByText('Hello')).toBeInTheDocument()",
    },
    {
      code: "expect(rendered.findByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(rendered.queryByText('Hello')).toBeInTheDocument()",
    },
    {
      code: "expect(findAllByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(queryAllByText('Hello')).toBeInTheDocument()",
    },
    {
      code: "expect(rendered.findAllByText('Hello')).toBeInTheDocument()",
      errors: [{ messageId: 'expectQueryBy' }],
      output: "expect(rendered.queryAllByText('Hello')).toBeInTheDocument()",
    },
  ],
});
