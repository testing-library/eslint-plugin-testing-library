import { createRuleTester } from '../test-utils';
import rule, {
  RULE_NAME,
} from '../../../lib/rules/render-result-naming-convention';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { render } from '@testing-library/react';
        
        test('should not report straight destructured render result', () => {
          const { rerender, getByText } = render(<SomeComponent />);
          const button = getByText('some button');
        });
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        test('should not report straight render result called "utils"', async () => {
          const utils = render(<SomeComponent />);
          await utils.findByRole('button');
        });
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        test('should not report straight render result called "view"', async () => {
          const view = render(<SomeComponent />);
          await view.findByRole('button');
        });
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        const setup = () => render(<SomeComponent />);
        
        test('should not report destructured render result from wrapping function', () => {
          const { rerender, getByText } = setup();
          const button = getByText('some button');
        });
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        const setup = () => render(<SomeComponent />);
        
        test('should not report render result called "utils" from wrapping function', async () => {
          const utils = setup();
          await utils.findByRole('button');
        });
      `,
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        const setup = () => render(<SomeComponent />);
        
        test('should not report render result called "view" from wrapping function', async () => {
          const view = setup();
          await view.findByRole('button');
        });
      `,
    },
    {
      code: `
        import { customRender } from 'test-utils';
        
        test('should not report straight destructured render result from custom render', () => {
          const { rerender, getByText } = customRender(<SomeComponent />);
          const button = getByText('some button');
        });
      `,
      options: [
        {
          renderFunctions: ['customRender'],
        },
      ],
    },
    {
      code: `
        import { customRender } from 'test-utils';
        
        test('should not report render result called "view" from custom render', async () => {
          const view = customRender();
          await view.findByRole('button');
        });
      `,
      options: [
        {
          renderFunctions: ['customRender'],
        },
      ],
    },
    {
      code: `
        import { customRender } from 'test-utils';
        
        test('should not report render result called "utils" from custom render', async () => {
          const utils = customRender();
          await utils.findByRole('button');
        });
      `,
      options: [
        {
          renderFunctions: ['customRender'],
        },
      ],
    },
    {
      code: `
        import { render } from '@foo/bar';
        
        test('should not report from render not related to testing library', () => {
          const wrapper = render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
    },
    {
      code: `
        import { render } from '@foo/bar';
        
        test('should not report from render not imported from testing library', () => {
          const wrapper = render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
    },
    {
      code: `
        function render() {
          return 'whatever';
        }
        
        test('should not report from custom render not related to testing library', () => {
          const wrapper = render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { render } from '@testing-library/react';
        
        test('should report straight render result called "wrapper"', async () => {
          const wrapper = render(<SomeComponent />);
          await wrapper.findByRole('button');
        });
      `,
      errors: [
        {
          messageId: 'invalidRenderResultName',
          data: {
            varName: 'wrapper',
          },
          line: 5,
          column: 17,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        test('should report straight render result called "component"', async () => {
          const component = render(<SomeComponent />);
          await component.findByRole('button');
        });
      `,
      errors: [
        {
          messageId: 'invalidRenderResultName',
          data: {
            varName: 'component',
          },
          line: 5,
          column: 17,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        test('should report straight render result called "notValidName"', async () => {
          const notValidName = render(<SomeComponent />);
          await notValidName.findByRole('button');
        });
      `,
      errors: [
        {
          messageId: 'invalidRenderResultName',
          line: 5,
          column: 17,
        },
      ],
    },
    {
      code: `
        import { render as testingLibraryRender } from '@testing-library/react';
        
        test('should report renamed render result called "wrapper"', async () => {
          const wrapper = testingLibraryRender(<SomeComponent />);
          await wrapper.findByRole('button');
        });
      `,
      errors: [
        {
          messageId: 'invalidRenderResultName',
          data: {
            varName: 'wrapper',
          },
          line: 5,
          column: 17,
        },
      ],
    },
    {
      code: `
        import { render } from '@testing-library/react';
        
        const setup = () => render(<SomeComponent />);

        test('should report render result called "wrapper" from wrapping function', async () => {
          const wrapper = setup();
          await wrapper.findByRole('button');
        });
      `,
      errors: [
        {
          messageId: 'invalidRenderResultName',
          data: {
            varName: 'wrapper',
          },
          line: 7,
          column: 17,
        },
      ],
    },
    {
      code: `
        import { customRender } from 'test-utils';

        test('should report from custom render function ', () => {
          const wrapper = customRender(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
      options: [
        {
          renderFunctions: ['customRender'],
        },
      ],
      errors: [
        {
          messageId: 'invalidRenderResultName',
          data: {
            varName: 'wrapper',
          },
          line: 5,
          column: 17,
        },
      ],
    },
  ],
});
