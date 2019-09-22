'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-debug');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
});
ruleTester.run('no-debug', rule, {
  valid: [
    {
      code: `debug()`,
    },
    {
      code: `() => {
        const somethingElse = {}
        const { debug } = foo()
        debug()
      }`,
    },
    {
      code: `
        const debug = require('debug')
        debug()
      `,
    },
    {
      code: `
        const { test } = render(<Component/>)
        test()
      `,
    },
    {
      code: `
        const utils = render(<Component/>)
        utils.debug
      `,
    },
    {
      code: `
        const utils = render(<Component/>)
        utils.foo()
      `,
    },
  ],

  invalid: [
    {
      code: `
        const { debug } = render(<Component/>)
        debug()
      `,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
    {
      code: `
        const utils = render(<Component/>)
        utils.debug()
      `,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
    {
      code: `
        const utils = render(<Component/>)
        utils.debug()
        utils.foo()
        utils.debug()
      `,
      errors: [
        {
          messageId: 'noDebug',
        },
        {
          messageId: 'noDebug',
        },
      ],
    },
  ],
});
