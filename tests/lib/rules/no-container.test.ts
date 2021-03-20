import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-container';

const ruleTester = createRuleTester();

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
    {
      code: `
        const { container: { firstChild } } = render(<Example />);
        expect(firstChild).toBeDefined();
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
          line: 3,
          column: 24,
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
          line: 3,
          column: 9,
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
          line: 3,
          column: 9,
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const view = render(<Example />);
        const button = view.container.querySelector('.btn-primary');
      `,
      errors: [
        {
          line: 3,
          column: 24,
          messageId: 'noContainer',
        },
      ],
    },
    {
      code: `
        const { container: { querySelector } } = render(<Example />);
        querySelector('foo');
      `,
      errors: [
        {
          line: 3,
          column: 9,
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
          line: 3,
          column: 9,
          messageId: 'noContainer',
        },
      ],
    },
  ],
});
