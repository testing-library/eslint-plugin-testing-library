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
        const myObj = {
          firstChild: 'Some custom text'
        }
        const text = myObj.firstChild
      `,
    },
  ],
  invalid: [
    {
      code: `screen.getByText('submit').closest('button')`,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        expect(screen.getByText('submit').closest('button').textContent).toBe('Submit')
      `,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const buttons = screen.getAllByRole('button');
        const buttonA = buttons[1];
      `,
      errors: [
        {
          // error points to `buttons[1]`
          line: 3,
          column: 25,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const buttons = screen.getAllByRole('button');
        buttons[0].firstChild;
      `,
      errors: [
        {
          // error points to `buttons[0]`
          line: 3,
          column: 9,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const buttons = screen.getAllByRole('button');
        const buttonA = buttons[1];
        expect(buttonA.lastChild).toBeInTheDocument();
      `,
      errors: [
        {
          // error points to `buttons[1]`
          line: 3,
          column: 25,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toBeInTheDocument();
      `,
      errors: [
        {
          // error points to `buttons[0]`
          line: 3,
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
          // error points to `buttonText.closest`
          line: 3,
          column: 24,
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
        }
        const exampleDOM = getExampleDOM();
        const buttons = screen.getAllByRole(exampleDOM, 'button');
        const buttonText = buttons[1].firstChild
      `,
      errors: [
        {
          // error points to `buttons[1]`
          line: 17,
          column: 28,
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
        }
        const exampleDOM = getExampleDOM();
        const submitButton = screen.getByText(exampleDOM, 'Submit');
        const previousSibling = submitButton.previousSibling
      `,
      errors: [
        {
          line: 17,
          column: 33,
          messageId: 'noNodeAccess',
        },
      ],
    },
  ],
});
