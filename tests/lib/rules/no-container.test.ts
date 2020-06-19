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
        render(<Example />);
        screen.getByRole('button', {name: /click me/i});
      `,
    },
    {
      code: `
        const { container } = render(<Example />);
        expect(container.firstChild).toBeDefined();
      `,
    },
    {
      code: `
        const { container: alias } = render(<Example />);
        expect(alias.firstChild).toBeDefined();
      `,
    },
    {
      code: `
        function getExampleDOM() {
          const container = document.createElement('div');
          container.innerHTML = \`
            <label for="username">Username</label>
            <input id="username" />
            <button>Print Username</button>
          \`;
          const button = container.querySelector('button');
      
          button.addEventListener('click', () => console.log('clicked'));
          return container;
      }

      const exampleDOM = getExampleDOM();
      screen.getByText(exampleDOM, 'Print Username').click();
      `,
    },
  ],
  invalid: [
    {
      code: `
        const { container } = render(<Example />);
        const button = container.querySelector('.btn-primary');
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const { container } = render(<Example />);
        container.querySelector();
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const { container: alias } = render(<Example />);
        alias.querySelector();
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const button = screen.container.querySelector('.btn-primary')
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const view = render(<Example />)
        const button = view.container.querySelector('.btn-primary')
      `,
      errors: [
        {
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const { container } = renderWithRedux(<Example />);
        container.querySelector();
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
