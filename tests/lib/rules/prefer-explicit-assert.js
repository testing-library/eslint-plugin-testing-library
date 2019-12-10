'use strict';

const rule = require('../../../lib/rules/prefer-explicit-assert');
const { ALL_QUERIES_METHODS } = require('../../../lib/utils');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('prefer-explicit-assert', rule, {
  valid: [
    {
      code: `getByText`,
    },
    {
      code: `const utils = render()
      
      utils.getByText
      `,
    },
    {
      code: `expect(getByText('foo')).toBeDefined()`,
    },
    {
      code: `const utils = render()
      
      expect(utils.getByText('foo')).toBeDefined()
      `,
    },
    {
      code: `expect(getByText('foo')).toBeInTheDocument();`,
    },
    {
      code: `expect(getByText('foo').bar).toBeInTheDocument()`,
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
      code: `getByIcon('foo')`, // custom `getBy` query not extended through options
    },
    {
      code: `const { getByText } = render()`,
    },
    {
      code: `it('test', () => { const { getByText } = render() })`,
    },
    {
      code: `it('test', () => { const [ getByText ] = render() })`,
    },
    {
      code: `const a = [ getByText('foo') ]`,
    },
    {
      code: `const a = { foo: getByText('bar') }`,
    },
    {
      code: `queryByText("foo")`,
    },
  ],

  invalid: [
    ...ALL_QUERIES_METHODS.map(queryMethod => ({
      code: `get${queryMethod}('foo')`,
      errors: [
        {
          messageId: 'preferExplicitAssert',
        },
      ],
    })),
    ...ALL_QUERIES_METHODS.map(queryMethod => ({
      code: `const utils = render()

      utils.get${queryMethod}('foo')`,
      errors: [
        {
          messageId: 'preferExplicitAssert',
          line: 3,
          column: 13,
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
          messageId: 'preferExplicitAssert',
          line: 2,
        },
        {
          messageId: 'preferExplicitAssert',
          line: 5,
        },
      ],
    })),
    // for coverage
    {
      code: `getByText("foo")`,
      options: [{ foo: 'bar' }],
      errors: [
        {
          messageId: 'preferExplicitAssert',
        },
      ],
    },
    {
      code: `getByIcon('foo')`, // custom `getBy` query extended through options
      options: [
        {
          customQueryNames: ['getByIcon'],
        },
      ],
      errors: [
        {
          messageId: 'preferExplicitAssert',
        },
      ],
    },
  ],
});
