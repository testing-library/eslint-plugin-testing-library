import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-debug';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `debug()`,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { screen } from 'somewhere-else'
      screen.debug()
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `() => {
        const somethingElse = {}
        const { debug } = foo()
        debug()
      }`,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
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
      settings: { 'testing-library/utils-module': 'test-utils' },
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
      code: `import * as dtl from '@testing-library/dom';
        const foo = dtl.debug;
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import * as foo from '@somewhere/else';
        foo.debug();
      `,
    },
    {
      code: `import { queries } from '@testing-library/dom'`,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        const { screen } = require('something-else')
        screen.debug()
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { screen } from 'something-else'
        screen.debug()
      `,
    },
    {
      code: `
        async function foo() {
          const foo = await bar;
        }
      `,
    },
  ],

  invalid: [
    {
      code: `debug()`,
      errors: [{ line: 1, column: 1, messageId: 'noDebug' }],
    },
    {
      code: `
      import { screen } from 'aggressive-reporting'
      screen.debug()
      `,
      errors: [{ line: 3, column: 14, messageId: 'noDebug' }],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { screen } from 'test-utils'
      screen.debug()
      `,
      errors: [{ line: 3, column: 14, messageId: 'noDebug' }],
    },
    {
      code: `
        const { debug } = render(<Component/>)
        debug()
      `,
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'noDebug',
        },
      ],
    },
    {
      settings: {
        'testing-library/custom-renders': ['customRender', 'renderWithRedux'],
      },
      code: `
        const { debug } = renderWithRedux(<Component/>)
        debug()
      `,
      errors: [
        {
          line: 3,
          column: 9,
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
          line: 3,
          column: 15,
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
          line: 3,
          column: 15,
          messageId: 'noDebug',
        },
        {
          line: 5,
          column: 15,
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
          line: 5,
          column: 11,
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
          line: 5,
          column: 17,
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
          line: 3,
          column: 16,
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
          line: 3,
          column: 16,
          messageId: 'noDebug',
        },
      ],
    },
    {
      // https://github.com/testing-library/eslint-plugin-testing-library/issues/174
      code: `
        import { screen, render } from '@testing-library/dom'
        screen.debug()
      `,
      errors: [
        {
          line: 3,
          column: 16,
          messageId: 'noDebug',
        },
      ],
    },
    {
      code: `
        import * as dtl from '@testing-library/dom';
        dtl.debug();
      `,
      errors: [
        {
          messageId: 'noDebug',
          line: 3,
          column: 13,
        },
      ],
    },
  ],
});
