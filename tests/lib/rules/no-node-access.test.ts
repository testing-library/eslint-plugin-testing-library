import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-node-access';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { screen } from '@testing-library/react';
        
        const buttonText = screen.getByText('submit');
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const { getByText } = screen
        const firstChild = getByText('submit');
        expect(firstChild).toBeInTheDocument()
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        const firstChild = screen.getByText('submit');
        expect(firstChild).toBeInTheDocument()
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';  
        
        const { getByText } = screen;
        const button = getByRole('button');
        expect(button).toHaveTextContent('submit');
      `,
    },
    {
      code: `
        import { render, within } from '@testing-library/react';

        const { getByLabelText } = render(<MyComponent />);
        const signinModal = getByLabelText('Sign In');
        within(signinModal).getByPlaceholderText('Username');
      `,
    },
    {
      code: `
      // case: importing custom module
      const closestButton = document.getElementById('submit-btn').closest('button');
      expect(closestButton).toBeInTheDocument();
      `,
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
    },
  ],
  invalid: [
    {
      code: `
      // case: without importing TL (aggressive reporting)
      const closestButton = document.getElementById('submit-btn')
      expect(closestButton).toBeInTheDocument();
      `,
      errors: [{ messageId: 'noNodeAccess', line: 3 }],
    },
    {
      code: `
        import { screen } from '@testing-library/react';
    
        const button = document.getElementById('submit-btn').closest('button');
      `,
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
      code: `
        import { screen } from '@testing-library/react';

        document.getElementById('submit-btn');
      `,
      errors: [
        {
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';
        
        screen.getByText('submit').closest('button');
      `,
      errors: [
        {
          // error points to `closest`
          line: 4,
          column: 36,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';
      
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
        import { render } from '@testing-library/react';  
        
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
        import { screen } from '@testing-library/react';

        const buttons = screen.getAllByRole('button');
        const childA = buttons[1].firstChild;
        const button = buttons[2];
        button.lastChild
      `,
      errors: [
        {
          // error points to `firstChild`
          line: 5,
          column: 35,
          messageId: 'noNodeAccess',
        },
        {
          // error points to `lastChild`
          line: 7,
          column: 16,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';
        
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
        import { render } from '@testing-library/react';
        
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
        import { render } from '@testing-library/react';
        
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
        import { screen } from '@testing-library/react';
        
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
          line: 19,
          column: 39,
          messageId: 'noNodeAccess',
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

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
          line: 19,
          column: 45,
          messageId: 'noNodeAccess',
        },
      ],
    },
  ],
});
