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
        screen.findByRole('button', {name: /hello/i})
    `,
    `
        import { screen } from '@testing-library/dom'
        screen.findByRole('button', {name: 'hello'})
    `,
    `
        const utils = render(<Component/>)
        utils.findByRole('button', {name: /hello/i})
    `,
    `
        const {queryAllByPlaceholderText} = render(<Component/>)
        queryAllByPlaceholderText(/hello/i)
    `,
  ],
  invalid: [
    {
      code: `
        import { screen } from '@testing-library/dom'
        screen.getByText(/hello/g)`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
        },
      ],
    },
    {
      code: `
          import { screen } from '@testing-library/dom'
          screen.findByRole('button', {name: /hello/g})`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
        },
      ],
    },
    {
      code: `
            import { screen } from '@testing-library/dom'
            screen.findByRole('button', {otherProp: true, name: /hello/g})`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
        },
      ],
    },
    {
      code: `
            const utils = render(<Component/>)
            utils.findByRole('button', {name: /hello/ig})`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
        },
      ],
    },
    {
      code: `
            const {queryAllByLabelText} = render(<Component/>)
            queryAllByLabelText(/hello/ig)`,
      errors: [
        {
          messageId: 'noGlobalRegExpFlagInQuery',
        },
      ],
    },
  ],
});
