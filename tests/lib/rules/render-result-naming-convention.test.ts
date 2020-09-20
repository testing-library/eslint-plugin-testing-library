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
        import * as RTL from '@testing-library/react';
        
        test('should not report straight destructured render result from wildcard import', () => {
          const { rerender, getByText } = RTL.render(<SomeComponent />);
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
        import { screen } from '@testing-library/react';
        import { customRender } from 'test-utils';
        
        test('should not report straight destructured render result from custom render', () => {
          const { unmount } = customRender(<SomeComponent />);
          const button = screen.getByText('some button');
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
        import * as RTL from '@foo/bar';
        
        test('should not report from wildcard render not imported from testing library', () => {
          const wrapper = RTL.render(<SomeComponent />);
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
    {
      code: `
        import { render } from '@testing-library/react';
        
        const setup = () => {
          // this one must have a valid name
          const view = render(<SomeComponent />);
          return view;
        };

        test('should not report render result called "view" from wrapping function', async () => {
          // this isn't a render technically so it can be called "wrapper"
          const wrapper = setup();
          await wrapper.findByRole('button');
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
          messageId: 'renderResultNamingConvention',
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
        import * as RTL from '@testing-library/react';
        
        test('should report straight render result called "wrapper" from wildcard import', () => {
          const wrapper = RTL.render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
      errors: [
        {
          messageId: 'renderResultNamingConvention',
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
          messageId: 'renderResultNamingConvention',
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
          messageId: 'renderResultNamingConvention',
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
          messageId: 'renderResultNamingConvention',
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
        
        const setup = () => {
          // this one must have a valid name
          const wrapper = render(<SomeComponent />);
          return wrapper;
        };

        test('should report render result called "wrapper" from wrapping function', async () => {
          // this isn't a render technically so it can be called "wrapper"
          const wrapper = setup();
          await wrapper.findByRole('button');
        });
      `,
      errors: [
        {
          messageId: 'renderResultNamingConvention',
          data: {
            varName: 'wrapper',
          },
          line: 6,
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
          messageId: 'renderResultNamingConvention',
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
