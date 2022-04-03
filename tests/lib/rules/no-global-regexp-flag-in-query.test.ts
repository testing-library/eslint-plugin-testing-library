import rule, {
  RULE_NAME,
} from '../../../lib/rules/no-global-regexp-flag-in-query';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    `
        import { screen } from '@testing-library/dom'
        screen.getByText(/hello/)
    `,
    `
        import { screen } from '@testing-library/dom'
        screen.getByText(/hello/i)
    `,
    `
        import { screen } from '@testing-library/dom'
        screen.getByText('hello')
    `,

    `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {name: /hello/})
    `,
    `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {name: /hello/im})
    `,
    `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {name: 'hello'})
    `,
    `
        const utils = render(<Component/>)
        utils.findByRole('button', {name: /hello/m})
    `,
    `
      const {queryAllByPlaceholderText} = render(<Component/>)
      queryAllByPlaceholderText(/hello/i)
    `,
    `
        import { within } from '@testing-library/dom'
        within(element).findByRole('button', {name: /hello/i})
    `,
    `
        import { within } from '@testing-library/dom'
        within(element).queryByText('Hello')
    `,
    `
        const text = 'hello';
        /hello/g.test(text)
        text.match(/hello/g)
    `,
    `
        const text = somethingElse()
        /hello/g.test(text)
        text.match(/hello/g)
    `,
    `
        import somethingElse from 'somethingElse'
        somethingElse.lookup(/hello/g)
    `,
    `
        import { screen } from '@testing-library/dom'
        screen.notAQuery(/hello/g)
    `,
    `
        import { screen } from '@testing-library/dom'
        screen.notAQuery('button', {name: /hello/g})
    `,
    `
        const utils = render(<Component/>)
        utils.notAQuery('button', {name: /hello/i})
    `,
    `
        const utils = render(<Component/>)
        utils.notAQuery(/hello/i)
    `,

    // issue #565
    {
      code: `
      import { screen } from "@testing-library/react"

      describe("App", () => {
        test("is rendered", async () => {
          await screen.findByText("Hello World", { exact: false });
        })
      })
    `,
    },
  ],
  invalid: [
    {
      code: `
        import { screen } from '@testing-library/dom'
        screen.getByText(/hello/g)`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
          line: 3,
          column: 26,
        },
      ],
      output: `
        import { screen } from '@testing-library/dom'
        screen.getByText(/hello/)`,
    },
    {
      code: `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {name: /hellogg/g})`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
          line: 3,
          column: 44,
        },
      ],
      output: `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {name: /hellogg/})`,
    },
    {
      code: `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {otherProp: true, name: /hello/g})`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
          line: 3,
          column: 61,
        },
      ],
      output: `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {otherProp: true, name: /hello/})`,
    },
    {
      code: `
        const utils = render(<Component/>)
        utils.findByRole('button', {name: /hello/ig})`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
          line: 3,
          column: 43,
        },
      ],
      output: `
        const utils = render(<Component/>)
        utils.findByRole('button', {name: /hello/i})`,
    },
    {
      code: `
        const {queryAllByLabelText} = render(<Component/>)
        queryAllByLabelText(/hello/gi)`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
          line: 3,
          column: 29,
        },
      ],
      output: `
        const {queryAllByLabelText} = render(<Component/>)
        queryAllByLabelText(/hello/i)`,
    },
    {
      code: `
        import { within } from '@testing-library/dom'
        within(element).findByRole('button', {name: /hello/igm})`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
          line: 3,
          column: 53,
        },
      ],
      output: `
        import { within } from '@testing-library/dom'
        within(element).findByRole('button', {name: /hello/im})`,
    },
    {
      code: `
        import { within } from '@testing-library/dom'
        within(element).queryAllByText(/hello/ig)`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
          line: 3,
          column: 40,
        },
      ],
      output: `
        import { within } from '@testing-library/dom'
        within(element).queryAllByText(/hello/i)`,
    },
  ],
});
