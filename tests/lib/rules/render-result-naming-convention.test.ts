import rule, {
	RULE_NAME,
} from '../../../lib/rules/render-result-naming-convention';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/vue',
	'@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
	valid: [
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
			{
				code: `
          import { render } from '${testingFramework}';
  
          test('should not report straight destructured render result', () => {
            const { rerender, getByText } = render(<SomeComponent />);
            const button = getByText('some button');
          });
        `,
			},
			{
				code: `
          import * as RTL from '${testingFramework}';
  
          test('should not report straight destructured render result from wildcard import', () => {
            const { rerender, getByText } = RTL.render(<SomeComponent />);
            const button = getByText('some button');
          });
        `,
			},
			{
				code: `
          import { render } from '${testingFramework}';
  
          test('should not report straight render result called "utils"', async () => {
            const utils = render(<SomeComponent />);
            await utils.findByRole('button');
          });
        `,
			},
			{
				code: `
          import { render } from '${testingFramework}';
  
          test('should not report straight render result called "view"', async () => {
            const view = render(<SomeComponent />);
            await view.findByRole('button');
          });
        `,
			},
			{
				code: `
          import { render } from '${testingFramework}';
  
          const setup = () => render(<SomeComponent />);
  
          test('should not report destructured render result from wrapping function', () => {
            const { rerender, getByText } = setup();
            const button = getByText('some button');
          });
        `,
			},
			{
				code: `
          import { render } from '${testingFramework}';
  
          const setup = () => render(<SomeComponent />);
  
          test('should not report render result called "utils" from wrapping function', async () => {
            const utils = setup();
            await utils.findByRole('button');
          });
        `,
			},
			{
				code: `
          import { render } from '${testingFramework}';
  
          const setup = () => render(<SomeComponent />);
  
          test('should not report render result called "view" from wrapping function', async () => {
            const view = setup();
            await view.findByRole('button');
          });
        `,
			},
			{
				code: `
          import { screen } from '${testingFramework}';
          import { customRender } from 'test-utils';
  
          test('should not report straight destructured render result from custom render', () => {
            const { unmount } = customRender(<SomeComponent />);
            const button = screen.getByText('some button');
          });
        `,
				settings: { 'testing-library/custom-renders': ['customRender'] },
			},
		]),
		{
			code: `
        import { customRender } from 'test-utils';

        test('should not report render result called "view" from custom render', async () => {
          const view = customRender();
          await view.findByRole('button');
        });
      `,
			settings: { 'testing-library/custom-renders': ['customRender'] },
		},
		{
			code: `
        import { customRender } from 'test-utils';

        test('should not report render result called "utils" from custom render', async () => {
          const utils = customRender();
          await utils.findByRole('button');
        });
      `,
			settings: { 'testing-library/custom-renders': ['customRender'] },
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
			{
				code: `
        import { render } from '${testingFramework}';

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
			{
				settings: { 'testing-library/utils-module': 'test-utils' },
				code: `
        import { render as testingLibraryRender } from '${testingFramework}';
        import { render } from '@somewhere/else'

        const setup = () => render(<SomeComponent />);

        test('aggressive reporting disabled - should not report nested render not related to TL', () => {
          const wrapper = setup();
          const button = wrapper.getByText('some button');
        });
      `,
			},
		]),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
				'testing-library/custom-renders': ['customRender'],
			},
			code: `
        import { customRender as myRender } from 'test-utils';
        import { customRender } from 'non-related'

        const setup = () => {
          return customRender(<SomeComponent />);
        };

        test(
        'both render and module aggressive reporting disabled - should not report render result called "wrapper" from non-related renamed custom render wrapped in a function',
        async () => {
          const wrapper = setup();
          await wrapper.findByRole('button');
        });
      `,
		},
		{
			settings: {
				'testing-library/utils-module': 'off',
				'testing-library/custom-renders': 'off',
			},
			code: `
        import { customRender as myRender } from 'test-utils';
        import { render } from 'non-related'

        const setup = () => {
          return render(<SomeComponent />);
        };

        test(
        'both render and module aggressive reporting switched off - should not report render result called "wrapper"',
        async () => {
          const wrapper1 = render();
          const wrapper2 = myRender();
          const wrapper3 = setup();

          await wrapper1.findByRole('button');
        });
      `,
		},
	],
	invalid: [
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
			{
				code: `
        import { render } from '${testingFramework}';

        test('should report straight render result called "wrapper"', async () => {
          const wrapper = render(<SomeComponent />);
          await wrapper.findByRole('button');
        });
      `,
				errors: [
					{
						messageId: 'renderResultNamingConvention',
						data: {
							renderResultName: 'wrapper',
						},
						line: 5,
						column: 17,
					},
				],
			} as const,
			{
				code: `
        import * as RTL from '${testingFramework}';

        test('should report straight render result called "wrapper" from wildcard import', () => {
          const wrapper = RTL.render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
				errors: [
					{
						messageId: 'renderResultNamingConvention',
						data: {
							renderResultName: 'wrapper',
						},
						line: 5,
						column: 17,
					},
				],
			} as const,
			{
				code: `
        import { render } from '${testingFramework}';

        test('should report straight render result called "component"', async () => {
          const component = render(<SomeComponent />);
          await component.findByRole('button');
        });
      `,
				errors: [
					{
						messageId: 'renderResultNamingConvention',
						data: {
							renderResultName: 'component',
						},
						line: 5,
						column: 17,
					},
				],
			} as const,
			{
				code: `
        import { render } from '${testingFramework}';

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
			} as const,
			{
				code: `
        import { render as testingLibraryRender } from '${testingFramework}';

        test('should report renamed render result called "wrapper"', async () => {
          const wrapper = testingLibraryRender(<SomeComponent />);
          await wrapper.findByRole('button');
        });
      `,
				errors: [
					{
						messageId: 'renderResultNamingConvention',
						data: {
							renderResultName: 'wrapper',
						},
						line: 5,
						column: 17,
					},
				],
			} as const,
			{
				code: `
        import { render } from '${testingFramework}';

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
							renderResultName: 'wrapper',
						},
						line: 6,
						column: 17,
					},
				],
			} as const,
			{
				settings: { 'testing-library/utils-module': 'test-utils' },
				code: `
        import { render } from '${testingFramework}';

        const setup = () => render(<SomeComponent />);

        test('aggressive reporting disabled - should report nested render from TL package', () => {
          const wrapper = setup();
          const button = wrapper.getByText('some button');
        });
      `,
				errors: [
					{
						messageId: 'renderResultNamingConvention',
						data: {
							renderResultName: 'wrapper',
						},
						line: 7,
						column: 17,
					},
				],
			} as const,
		]),
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { render } from 'test-utils';

        function setup() {
          doSomethingElse();
          return render(<SomeComponent />)
        }

        test('aggressive reporting disabled - should report nested render from custom utils module', () => {
          const wrapper = setup();
          const button = wrapper.getByText('some button');
        });
      `,
			errors: [
				{
					messageId: 'renderResultNamingConvention',
					data: {
						renderResultName: 'wrapper',
					},
					line: 10,
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
			settings: { 'testing-library/custom-renders': ['customRender'] },
			errors: [
				{
					messageId: 'renderResultNamingConvention',
					data: {
						renderResultName: 'wrapper',
					},
					line: 5,
					column: 17,
				},
			],
		},
		{
			code: `
        import { render } from '@foo/bar';

        test('aggressive reporting - should report from render not related to testing library', () => {
          const wrapper = render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
			errors: [
				{
					messageId: 'renderResultNamingConvention',
					data: {
						renderResultName: 'wrapper',
					},
					line: 5,
					column: 17,
				},
			],
		},
		{
			code: `
        import * as RTL from '@foo/bar';

        test('aggressive reporting - should report from wildcard render not imported from testing library', () => {
          const wrapper = RTL.render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
			errors: [
				{
					messageId: 'renderResultNamingConvention',
					data: {
						renderResultName: 'wrapper',
					},
					line: 5,
					column: 17,
				},
			],
		},
		{
			code: `
        function render() {
          return 'whatever';
        }

        test('aggressive reporting - should report from custom render not related to testing library', () => {
          const wrapper = render(<SomeComponent />);
          const button = wrapper.getByText('some button');
        });
      `,
			errors: [
				{
					messageId: 'renderResultNamingConvention',
					data: {
						renderResultName: 'wrapper',
					},
					line: 7,
					column: 17,
				},
			],
		},
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
			{
				code: `
        import { render as testingLibraryRender } from '${testingFramework}';

        const setup = () => {
          return testingLibraryRender(<SomeComponent />);
        };

        test('should report render result called "wrapper" from renamed render wrapped in a function', async () => {
          const wrapper = setup();
          await wrapper.findByRole('button');
        });
      `,
				errors: [
					{
						messageId: 'renderResultNamingConvention',
						data: {
							renderResultName: 'wrapper',
						},
						line: 9,
						column: 17,
					},
				],
			} as const,
			{
				settings: { 'testing-library/utils-module': 'test-utils' },
				code: `
        import { render as testingLibraryRender } from '${testingFramework}';

        const setup = () => {
          return testingLibraryRender(<SomeComponent />);
        };

        test(
        'aggressive reporting disabled - should report render result called "wrapper" from renamed render wrapped in a function',
        async () => {
          const wrapper = setup();
          await wrapper.findByRole('button');
        });
      `,
				errors: [
					{
						messageId: 'renderResultNamingConvention',
						data: {
							renderResultName: 'wrapper',
						},
						line: 11,
						column: 17,
					},
				],
			} as const,
		]),
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
				'testing-library/custom-renders': ['customRender'],
			},
			code: `
        import { customRender as myRender } from 'test-utils';

        const setup = () => {
          return myRender(<SomeComponent />);
        };

        test(
        'both render and module aggressive reporting disabled - should report render result called "wrapper" from renamed custom render wrapped in a function',
        async () => {
          const wrapper = setup();
          await wrapper.findByRole('button');
        });
      `,
			errors: [
				{
					messageId: 'renderResultNamingConvention',
					data: {
						renderResultName: 'wrapper',
					},
					line: 11,
					column: 17,
				},
			],
		},
	],
});
