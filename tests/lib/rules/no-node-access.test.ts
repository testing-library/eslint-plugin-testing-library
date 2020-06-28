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
        const obj = {
            firstChild: <div>child</div>
        }
        obj.firstChild
      `,
    },
  ],
  invalid: [
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
          messageId: 'noNodeAccess',
        },
      ],
    },
  ],
});
