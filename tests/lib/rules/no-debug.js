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
    sourceType: 'module',
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
        let foo
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
    {
      code: `screen.debug()`,
    },
    {
      code: `
        const { screen } = require('@testing-library/dom')
        screen.debug
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/dom'
        screen.debug
      `,
    },
    {
      code: `const { queries } = require('@testing-library/dom')`,
    },
    {
      code: `import { queries } from '@testing-library/dom'`,
    },
    {
      code: `
        const { screen } = require('something-else')
        screen.debug()
      `,
    },
    {
      code: `
        import { screen } from 'something-else'
        screen.debug()
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
        const { debug } = renderWithRedux(<Component/>)
        debug()
      `,
      options: [
        {
          renderFunctions: ['renderWithRedux'],
        },
      ],
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
    {
      code: `
      describe(() => {
        test(async () => {
          const { debug } = await render("foo")
          debug()
        })
      })`,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
    {
      code: `
      describe(() => {
        test(async () => {
          const utils = await render("foo")
          utils.debug()
        })
      })`,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
    {
      code: `
        const { screen } = require('@testing-library/dom')
        screen.debug()
      `,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/dom'
        screen.debug()
      `,
      errors: [
        {
          messageId: 'noDebug',
        },
      ],
    },
  ],
});
