'use strict';

const rule = require('../../../lib/rules/no-get-by-assert');
const { ALL_QUERIES_METHODS } = require('../../../lib/utils');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('no-get-by-assert', rule, {
  valid: [
    {
      code: `getByText`,
    },
    {
      code: `expect(getByText('foo')).toBeDefined()`,
    },
    {
      code: `expect(getByText('foo')).toBeInTheDocument();`,
    },
    {
      code: `async () => { await waitForElement(() => getByText('foo')) }`,
    },
    {
      code: `fireEvent.click(getByText('bar'));`,
    },
    {
      code: `const quxElement = getByText('qux')`,
    },
    {
      code: `() => { return getByText('foo') }`,
    },
    {
      code: `function bar() { return getByText('foo') }`,
    },
    {
      code: `getByNonTestingLibraryVariant('foo')`,
    },
  ],

  invalid: [
    ...ALL_QUERIES_METHODS.map(queryMethod => ({
      code: `get${queryMethod}('foo')`,
      errors: [
        {
          messageId: 'noGetByAssert',
        },
      ],
    })),
    ...ALL_QUERIES_METHODS.map(queryMethod => ({
      code: `() => {
        get${queryMethod}('foo')
        doSomething()

        get${queryMethod}('bar')
        const quxElement = get${queryMethod}('qux')
      }
      `,
      errors: [
        {
          messageId: 'noGetByAssert',
          line: 2,
        },
        {
          messageId: 'noGetByAssert',
          line: 5,
        },
      ],
    })),
  ],
});
