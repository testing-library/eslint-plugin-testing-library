import rule, { RULE_NAME } from '../../../lib/rules/no-container';
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
		...SUPPORTED_TESTING_FRAMEWORKS.map(
			(testingFramework) =>
				({
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
          import { render as renamed } from '${testingFramework}'
          import { render } from 'somewhere-else'
          const { container } = render(<Example />);
          const button = container.querySelector('.btn-primary');
        `,
				} as const)
		),
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
		{
			code: `
				const { container } = render(<Example />);
				const newElement = document.createElement('div');
				newElement.innerHTML;
			`,
		},
		{
			code: `
				const { container } = render(<Example />);
				const newElement = document.createElement('div');
				newElement.firstChild;
			`,
		},
		{
			code: `
				const { container } = render(<Example />);
				container.firstChild;
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
		...SUPPORTED_TESTING_FRAMEWORKS.map(
			(testingFramework) =>
				({
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
        import { render as testingRender } from '${testingFramework}'
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
				} as const)
		),
		...SUPPORTED_TESTING_FRAMEWORKS.map(
			(testingFramework) =>
				({
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
        import { render } from '${testingFramework}'

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
				} as const)
		),
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
		...SUPPORTED_TESTING_FRAMEWORKS.map(
			(testingFramework) =>
				({
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
        import { render } from '${testingFramework}'
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
				} as const)
		),
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
		{
			code: `
				const { container } = render(<Example />);
				container.innerHTML;
			`,
			errors: [
				{
					line: 3,
					// TODO: Spaces & tabs mess up this
					column: 5,
					messageId: 'noContainer',
				},
			],
		},
	],
});
