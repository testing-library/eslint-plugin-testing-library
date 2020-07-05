import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-node-access';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        const buttonText = screen.getByText('submit');
      `,
    },
    {
      code: `
        const { getByText } = screen
        const firstChild = getByText('submit');
        expect(firstChild).toBeInTheDocument()
      `,
    },
    {
      code: `
        const firstChild = screen.getByText('submit');
        expect(firstChild).toBeInTheDocument()
      `,
    },
    {
      code: `
        const { getByText } = screen;
        const button = getByRole('button');
        expect(button).toHaveTextContent('submit');
      `,
    },
  ],
  invalid: [
    {
      code: `document.getElementById('submit-btn').closest('button');`,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `document.getElementById('submit-btn');`,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `screen.getByText('submit').closest('button');`,
      errors: [
        {
          // error points to `closest`
          line: 1,
          column: 28,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
      expect(screen.getByText('submit').closest('button').textContent).toBe('Submit');
      `,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const { getByText } = render(<Example />)
        getByText('submit').closest('button');
      `,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const closestButton = document.getElementById('submit-btn').closest('button');
        expect(closestButton).toBeInTheDocument();
      `,
      errors: [
        {
          // error points to `getElementById`
          line: 2,
          column: 40,
          messageId: 'noNodeAccess',
        },
        {
          // error points to `closest`
          line: 2,
          column: 69,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const buttons = screen.getAllByRole('button');
        const childA = buttons[1].firstChild;
        const button = buttons[2];
        button.lastChild
      `,
      errors: [
        {
          // error points to `firstChild`
          line: 3,
          column: 35,
          messageId: 'noNodeAccess',
        },
        {
          // error points to `lastChild`
          line: 5,
          column: 16,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const buttonText = screen.getByText('submit');
        const button = buttonText.closest('button');
      `,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const { getByText } = render(<Example />)
        const buttonText = getByText('submit');
        const button = buttonText.closest('button');
      `,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const { getByText } = render(<Example />)
        const button = getByText('submit').closest('button');
      `,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        function getExampleDOM() {
            const container = document.createElement('div');
            container.innerHTML = \`
                <label for="username">Username</label>
                <input id="username" />
                <button>Print Username</button>
                <label for="password">Password</label>
                <input id="password" />
                <button>Print password</button>
                <button type="submit">Submit</button>
            \`;
            return container;
        };
        const exampleDOM = getExampleDOM();
        const buttons = screen.getAllByRole(exampleDOM, 'button');
        const buttonText = buttons[1].firstChild;
      `,
      errors: [
        {
          // error points to `firstChild`
          line: 17,
          column: 39,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        function getExampleDOM() {
            const container = document.createElement('div');
            container.innerHTML = \`
                <label for="username">Username</label>
                <input id="username" />
                <button>Print Username</button>
                <label for="password">Password</label>
                <input id="password" />
                <button>Print password</button>
                <button type="submit">Submit</button>
            \`;
            return container;
        };
        const exampleDOM = getExampleDOM();
        const submitButton = screen.getByText(exampleDOM, 'Submit');
        const previousButton = submitButton.previousSibling;
      `,
      errors: [
        {
          // error points to `previousSibling`
          line: 17,
          column: 45,
          messageId: 'noNodeAccess',
        },
      ],
    },
  ],
});
