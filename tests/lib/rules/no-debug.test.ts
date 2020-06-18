import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-debug';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run(RULE_NAME, rule, {
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
      code: `import * as dtl from '@testing-library/dom';
        const foo = dtl.debug;
      `,
    },
    {
      code: `
        import * as foo from '@somewhere/else';
        foo.debug();
      `,
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
    {
      // https://github.com/testing-library/eslint-plugin-testing-library/issues/174
      code: `
        import { screen, render } from '@testing-library/dom'
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
