import rule, { RULE_NAME } from '../../../lib/rules/no-container';
import { createRuleTester } from '../test-utils';

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
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render as renamed } from '@testing-library/react'
        import { render } from 'somewhere-else'
        const { container } = render(<Example />);
        const button = container.querySelector('.btn-primary');
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render as renamed } from '@marko/testing-library'
        import { render } from 'somewhere-else'
        const { container } = render(<Example />);
        const button = container.querySelector('.btn-primary');
      `,
    },
    {
      settings: {
        'testing-library/custom-renders': ['customRender', 'renderWithRedux'],
      },
      code: `
        import { otherRender } from 'somewhere-else'
        const { container } = otherRender(<Example />);
        const button = container.querySelector('.btn-primary');
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render } from 'test-utils'
        const { container } = render(<Example />);
        const button = container.querySelector('.btn-primary');
      `,
      errors: [
        {
          line: 4,
          column: 24,
          messageId: 'noContainer',
        },
      ],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render as testingRender } from '@testing-library/react'
        const { container: renamed } = testingRender(<Example />);
        const button = renamed.querySelector('.btn-primary');
      `,
      errors: [
        {
          line: 4,
          column: 24,
          messageId: 'noContainer',
        },
      ],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render } from '@testing-library/react'

        const setup = () => render(<Example />)

        const { container } = setup()
        const button = container.querySelector('.btn-primary');
      `,
      errors: [
        {
          line: 7,
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
          column: 29,
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
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render } from '@testing-library/react'
        const { container: { querySelector } } = render(<Example />);
        querySelector('foo');
      `,
      errors: [
        {
          line: 4,
          column: 9,
          messageId: 'noContainer',
        },
      ],
    },
    {
      settings: {
        'testing-library/custom-renders': ['customRender', 'renderWithRedux'],
      },
      code: `
        const { container } = renderWithRedux(<Example />);
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
  ],
});
