import rule, { RULE_NAME } from '../../../lib/rules/no-debugging-utils';
import { createRuleTester } from '../test-utils';

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
      code: `console.debug()`,
    },
    {
      code: `
        const consoleDebug = console.debug
        consoleDebug()
      `,
    },
    {
      code: `
        const { debug } = console
        debug()
      `,
    },
    {
      code: `
        const { debug: consoleDebug } = console
        consoleDebug()
      `,
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
      code: `
        import { screen } from '@testing-library/dom'
        screen.logTestingPlaygroundURL()
      `,
      options: [{ utilsToCheckFor: { logTestingPlaygroundURL: false } }],
    },
    {
      code: `
        import { screen } from '@testing-library/dom'
        screen.logTestingPlaygroundURL()
      `,
      options: [{ utilsToCheckFor: undefined }],
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
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { debug as testingDebug } from 'test-utils'
      import { debug } from 'somewhere-else'

      debug()
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render as testingRender } from '@testing-library/react'
      import { render } from 'somewhere-else'

      const { debug } = render(element)

      somethingElse()
      debug()
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render as testingRender } from '@marko/testing-library'
      import { render } from 'somewhere-else'

      const { debug } = render(element)

      somethingElse()
      debug()
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render as testingRender } from '@testing-library/react'
      import { render } from 'somewhere-else'

      const { debug } = render(element)
      const { debug: testingDebug } = testingRender(element)

      somethingElse()
      debug()
      `,
    },

    `// cover edge case for https://github.com/testing-library/eslint-plugin-testing-library/issues/306
    thing.method.lastCall.args[0]();
    `,
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { debug as testingDebug } from 'test-utils'
      testingDebug()
      `,
      errors: [{ line: 3, column: 7, messageId: 'noDebug' }],
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render } from 'test-utils'

        const setup = () => render(<Component/>)

        const utils = setup()
        utils.debug()
      `,
      errors: [
        {
          line: 7,
          column: 15,
          messageId: 'noDebug',
        },
      ],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// aggressive reporting disabled
        import { render } from 'test-utils'
        const utils = render(<Component/>)
        utils.debug()
      `,
      errors: [
        {
          line: 4,
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// aggressive reporting disabled
        import { render } from 'test-utils'
        const utils = render(<Component/>)
        utils.debug()
        utils.foo()
        utils.debug()
      `,
      errors: [
        {
          line: 4,
          column: 15,
          messageId: 'noDebug',
        },
        {
          line: 6,
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// aggressive reporting disabled
      import { render } from 'test-utils'
      describe(() => {
        test(async () => {
          const { debug } = await render("foo")
          debug()
        })
      })`,
      errors: [
        {
          line: 6,
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// aggressive reporting disabled
      import { render } from 'test-utils'
      describe(() => {
        test(async () => {
          const utils = await render("foo")
          utils.debug()
        })
      })`,
      errors: [
        {
          line: 6,
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// aggressive reporting disabled
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
      code: `
        import { screen } from '@testing-library/dom'
        screen.logTestingPlaygroundURL()
      `,
      options: [{ utilsToCheckFor: { logTestingPlaygroundURL: true } }],
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
        import { logRoles } from '@testing-library/dom'
        logRoles(document.createElement('nav'))
      `,
      options: [{ utilsToCheckFor: { logRoles: true } }],
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
        import { screen } from '@testing-library/dom'
        screen.logTestingPlaygroundURL()
      `,
      options: [{ utilsToCheckFor: { logRoles: true } }],
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
        screen.logTestingPlaygroundURL()
      `,
      options: [{ utilsToCheckFor: { debug: false } }],
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
        screen.logTestingPlaygroundURL()
      `,
      options: [{ utilsToCheckFor: {} }],
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
        screen.logTestingPlaygroundURL()
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// aggressive reporting disabled
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// aggressive reporting disabled
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
      settings: { 'testing-library/utils-module': 'test-utils' },
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
    {
      code: `
      import { render } from 'aggressive-reporting'

      const { debug } = render(element)

      somethingElse()
      debug()
      `,
      errors: [{ line: 7, column: 7, messageId: 'noDebug' }],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render } from '@testing-library/react'

      const { debug } = render(element)

      somethingElse()
      debug()
      `,
      errors: [{ line: 7, column: 7, messageId: 'noDebug' }],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render } from '@marko/testing-library'

      const { debug } = render(element)

      somethingElse()
      debug()
      `,
      errors: [{ line: 7, column: 7, messageId: 'noDebug' }],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render } from 'test-utils'

      const { debug: renamed } = render(element)

      somethingElse()
      renamed()
      `,
      errors: [{ line: 7, column: 7, messageId: 'noDebug' }],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render } from '@testing-library/react'

      const utils = render(element)

      somethingElse()
      utils.debug()
      `,
      errors: [{ line: 7, column: 13, messageId: 'noDebug' }],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
        'testing-library/custom-renders': ['testingRender'],
      },
      code: `// aggressive reporting disabled, custom render set
      import { testingRender } from 'test-utils'

      const { debug: renamedDebug } = testingRender(element)

      somethingElse()
      renamedDebug()
      `,
      errors: [{ line: 7, column: 7, messageId: 'noDebug' }],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      import { render } from '@testing-library/react'

      const utils = render(element)
      const { debug: renamedDestructuredDebug } = console
      const { debug } = console
      const assignedDebug = console.debug
      console.debug('debugging')
      debug('destructured')
      assignedDebug('foo')
      // the following line is the one that fails
      utils.debug()
      renamedDestructuredDebug('foo')
      `,
      errors: [{ line: 12, column: 13, messageId: 'noDebug' }],
    },
  ],
});
