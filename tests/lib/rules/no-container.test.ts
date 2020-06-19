import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-container';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        render(<Example />)
        screen.getByRole('button', {name: /click me/i})
      `,
    },
    {
      code: `
        const { container } = render(<Example />)
        expect(container.firstChild).toBeDefined()
      `,
    },
    {
      code: `
        const { container: alias } = render(<Example />)
        expect(alias.firstChild).toBeDefined()
      `,
    },
  ],
  invalid: [
    {
      code: `
        const { container } = render(<Example />)
        const button = container.querySelector('.btn-primary')
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const { container } = render(<Example />)
        container.querySelector()
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const { container: alias } = render(<Example />)
        alias.querySelector()
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const { container } = renderWithRedux(<Example />)
        container.querySelector()
      `,
      options: [
        {
          renderFunctions: ['renderWithRedux'],
        },
      ],
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
  ],
});
