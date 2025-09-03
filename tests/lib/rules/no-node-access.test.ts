import { InvalidTestCase, ValidTestCase } from '@typescript-eslint/rule-tester';

import rule, {
	RULE_NAME,
	Options,
	MessageIds,
} from '../../../lib/rules/no-node-access';
import { EVENT_HANDLER_METHODS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

type RuleValidTestCase = ValidTestCase<Options>;
type RuleInvalidTestCase = InvalidTestCase<MessageIds, Options>;

const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/vue',
	'@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
	valid: [
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleValidTestCase>(
			(testingFramework) => [
				{
					code: `
        import { screen } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
      `,
				},
				{
					code: `
        import { screen } from '${testingFramework}';

        const { getByText } = screen
        const firstChild = getByText('submit');
        expect(firstChild).toBeInTheDocument()
      `,
				},
				{
					code: `
        import { screen } from '${testingFramework}';

        const firstChild = screen.getByText('submit');
        expect(firstChild).toBeInTheDocument()
      `,
				},
				{
					code: `
        import { screen } from '${testingFramework}';

        const { getByText } = screen;
        const button = getByRole('button');
        expect(button).toHaveTextContent('submit');
      `,
				},
				{
					code: `
        import { render, within } from '${testingFramework}';

        const { getByLabelText } = render(<MyComponent />);
        const signInModal = getByLabelText('Sign In');
        within(signInModal).getByPlaceholderText('Username');
      `,
				},
				{
					code: `
      // case: code not related to ${testingFramework} at all
      ReactDOM.render(
        <CommProvider useDsa={false}>
          <ThemeProvider>
            <GlobalStyle />
            <Suspense fallback={<Loader />}>
              <AppLogin />
            </Suspense>
          </ThemeProvider>
        </CommProvider>,

        document.getElementById('root')
      );
      `,
				},
				{
					code: `// issue #386 examples, props.children should not be reported
				import { screen } from '${testingFramework}';
				jest.mock('@/some/path', () => ({
					someProperty: jest.fn((props) => props.children),
				  }));
				`,
				},
				{
					code: `// issue #386 examples
				import { screen } from '${testingFramework}';
				function ComponentA(props) {
					if (props.children) {
					  // ...
					}

					return <div>{props.children}</div>
				  }
				`,
				},
				{
					code: `/* related to issue #386 fix
				* now all node accessing properties (listed in lib/utils/index.ts, in PROPERTIES_RETURNING_NODES)
				* will not be reported by this rule because anything props.something won't be reported.
				*/
				import { screen } from '${testingFramework}';
				function ComponentA(props) {
					if (props.firstChild) {
					  // ...
					}

					return <div>{props.nextSibling}</div>
				  }
				`,
				},
				{
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `
      // case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
      const closestButton = document.getElementById('submit-btn').closest('button');
      expect(closestButton).toBeInTheDocument();
      `,
				},
				{
					code: `
      // case: without importing ${testingFramework} (aggressive reporting skipped)
      const closestButton = document.getElementById('submit-btn')
      expect(closestButton).toBeInTheDocument();
      `,
				},
				{
					options: [{ allowContainerFirstChild: true }],
					code: `
        import { render } from '${testingFramework}';

        const { container } = render(<MyComponent />)

        expect(container.firstChild).toMatchSnapshot()
      `,
				},
				{
					// Example from discussions in issue #386
					code: `
				import { render } from '${testingFramework}';

				function Wrapper({ children }) {
					// this should NOT be reported
					if (children) {
					  // ...
					}

					// this should NOT be reported
					return <div className="wrapper-class">{children}</div>
				  };

				render(<Wrapper><SomeComponent /></Wrapper>);
				expect(screen.getByText('SomeComponent')).toBeInTheDocument();
				`,
				},
				{
					code: `
				import userEvent from '@testing-library/user-event';
        import { screen } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
				const user = userEvent.setup();
				user.click(buttonText);
      `,
				},
				{
					code: `
				import userEvent from '@testing-library/user-event';
        import { screen } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
				const userAlias = userEvent.setup();
				userAlias.click(buttonText);
      `,
				},
				{
					code: `
				import userEvent from '@testing-library/user-event';
				import { screen } from '${testingFramework}';
				test('...', () => {
					const buttonText = screen.getByText('submit');
					(() => { click: userEvent.click(buttonText); })();
				});
      `,
				},
				{
					code: `
				import userEvent from '@testing-library/user-event';
        import { screen } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
				userEvent.setup().click(buttonText);
      `,
				},
				{
					code: `
				import userEvent, { type UserEvent } from '@testing-library/user-event';
        import { screen } from '${testingFramework}';

				const click = async (user: UserEvent, element: HTMLElement) => {
					await user.click(element);
				};
        const buttonText = screen.getByText('submit');
				await click(userEvent, buttonText);
      `,
				},
				{
					code: `
				import userEvt from '@testing-library/user-event';
        import { screen } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
				const userAlias = userEvt.setup();
				userAlias.click(buttonText);
      `,
				},
				{
					code: `
				import userEvt from '@testing-library/user-event';
        import { screen } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
				userEvt.click(buttonText);
      `,
				},
				{
					code: `
				import { screen } from '${testingFramework}';
				import userEvent from '@testing-library/user-event';

				describe('Testing', () => {
					let user;

					beforeEach(() => {
						user = userEvent.setup();
					});

					it('test 1', async () => {
						await user.click(screen.getByRole('button'));
					});
				});
      `,
				},
				{
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
				import { screen, userEvent } from 'test-utils';

				describe('Testing', () => {
					let user;

					beforeEach(() => {
						user = userEvent.setup();
					});

					it('test 1', async () => {
						await user.click(screen.getByRole('button'));
					});
				});
      `,
				},
				{
					code: `
        import { screen, fireEvent as fe } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
				fe.click(buttonText);
      `,
				},
				{
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
        import { screen, fireEvent as fe } from 'test-utils';

        const buttonText = screen.getByText('submit');
				fe.click(buttonText);
      `,
				},
				{
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
        import { screen, fireEvent } from '../test-utils';

        const buttonText = screen.getByText('submit');
				fireEvent.click(buttonText);
      `,
				},
				{
					code: `
				import { screen } from '${testingFramework}';

        const ui = {
					select: screen.getByRole('combobox', {name: 'Test label'}),
				};
				test('...', () => {
					const select = ui.select.get();
					expect(select).toHaveClass(selectClasses.select);
				});
      `,
				},
				{
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
        import { screen, render } from 'test-utils';
				import MyComponent from './MyComponent'

				test('...', async () => {
					const { user } = render(<MyComponent />)
					await user.click(screen.getByRole("button"))
				});
      `,
				},
				{
					settings: { 'testing-library/utils-module': 'test-utils' },
					code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
        import { screen, render } from 'test-utils';
				import MyComponent from './MyComponent'

				test('...', async () => {
					const result = render(<MyComponent />)
					await result.user.click(screen.getByRole("button"))
				});
      `,
				},
				{
					settings: {
						'testing-library/utils-module': 'TestUtils',
						'testing-library/custom-renders': ['renderComponent'],
					},
					code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
        import { screen, renderComponent } from './TestUtils';
				import MyComponent from './MyComponent'

				test('...', async () => {
					const result = renderComponent(<MyComponent />)
					await result.user.click(screen.getByRole("button"))
				});
      `,
				},
				{
					code: `
				import { screen } from '${testingFramework}';

				class Hoge {
					submit() {}
					click() {}
				}

				test('...', () => {
						const pm = new Hoge();
						pm.click();
						pm.submit();
				});`,
				},
				{
					code: `
				import { user } from 'hoge'
				import { screen } from '${testingFramework}';

				test('...', () => {
				 	const button = screen.getByRole('button');
					user.click(button)
					user.select(button)
					user.submit(button)
				})
				`,
				},
			]
		),
		{
			code: `
		import { select } from "@wordpress/data"

		const selectMyPluginReduxStore = () => select("my-plugin/foo")
		`,
		},
	],
	invalid: SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
		{
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
      // case: importing from custom module for ${testingFramework} (aggressive reporting limited)
      import 'test-utils';
      const closestButton = document.getElementById('submit-btn')
      expect(closestButton).toBeInTheDocument();
      `,
			errors: [{ line: 4, column: 38, messageId: 'noNodeAccess' }],
		},
		{
			code: `
        import { screen } from '${testingFramework}';

        const button = document.getElementById('submit-btn').closest('button');
      `,
			errors: [
				{
					line: 4,
					column: 33,
					messageId: 'noNodeAccess',
				},
				{
					line: 4,
					column: 62,
					messageId: 'noNodeAccess',
				},
			],
		},
		{
			code: `
        import { screen } from '${testingFramework}';

        document.getElementById('submit-btn');
      `,
			errors: [
				{
					line: 4,
					column: 18,
					messageId: 'noNodeAccess',
				},
			],
		},
		{
			code: `
        import { screen } from '${testingFramework}';

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
        import { screen } from '${testingFramework}';

        expect(screen.getByText('submit').closest('button').textContent).toBe('Submit');
      `,
			errors: [
				{
					line: 4,
					column: 43,
					messageId: 'noNodeAccess',
				},
			],
		},
		{
			code: `
        import { render } from '${testingFramework}';

        const { getByText } = render(<Example />)
        getByText('submit').closest('button');
      `,
			errors: [{ line: 5, column: 29, messageId: 'noNodeAccess' }],
		},
		{
			code: `
        import { screen } from '${testingFramework}';

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
        import { screen } from '${testingFramework}';

        const buttonText = screen.getByText('submit');
        const button = buttonText.closest('button');
      `,
			errors: [{ line: 5, column: 35, messageId: 'noNodeAccess' }],
		},
		{
			code: `
        import { render } from '${testingFramework}';

        const { getByText } = render(<Example />)
        const buttonText = getByText('submit');
        const button = buttonText.closest('button');
      `,
			errors: [
				{
					line: 6,
					column: 35,
					messageId: 'noNodeAccess',
				},
			],
		},
		{
			code: `
        import { render } from '${testingFramework}';

        const { getByText } = render(<Example />)
        const button = getByText('submit').closest('button');
      `,
			errors: [{ line: 5, column: 44, messageId: 'noNodeAccess' }],
		},
		{
			code: `
        import { screen } from '${testingFramework}';

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
        import { screen } from '${testingFramework}';

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
		{
			code: `
        import { render } from '${testingFramework}';

        const { container } = render(<MyComponent />)

        expect(container.firstChild).toMatchSnapshot()
      `,
			errors: [
				{
					// error points to `firstChild`
					line: 6,
					column: 26,
					messageId: 'noNodeAccess',
				},
			],
		},
		{
			code: `
        import { render } from '${testingFramework}';

        const { container } = render(<ul><li>item</li><li>item</li></ul>)

        expect(container.childElementCount).toBe(2)
      `,
			errors: [
				{
					// error points to `childElementCount`
					line: 6,
					column: 26,
					messageId: 'noNodeAccess',
				},
			],
		},
		...EVENT_HANDLER_METHODS.flatMap<RuleInvalidTestCase>((method) => [
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByLabelText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 50,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByLabelText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 50,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByPlaceholderText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 56,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByPlaceholderText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 56,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 45,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 45,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByAltText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 48,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByAltText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 48,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByTitle('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 46,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByTitle('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 46,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByDisplayValue('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 53,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByDisplayValue('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 53,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByRole('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 45,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByRole('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 45,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByTestId('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.getByTestId('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByLabelText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 51,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByLabelText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 51,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByPlaceholderText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 57,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByPlaceholderText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 57,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 46,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 46,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByAltText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 49,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByAltText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 49,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByTitle('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByTitle('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByDisplayValue('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 54,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByDisplayValue('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 54,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByRole('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 46,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByRole('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 46,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByTestId('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 48,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.findByTestId('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 48,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByLabelText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 52,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByLabelText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 52,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByPlaceholderText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 58,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByPlaceholderText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 58,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByAltText('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 50,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByAltText('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 50,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByTitle('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 48,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByTitle('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 48,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByDisplayValue('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 55,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByDisplayValue('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 55,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByRole('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByRole('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 47,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByTestId('foo')['${method}']();
      `,
				errors: [
					{
						line: 4,
						column: 49,
						messageId: 'noNodeAccess',
					},
				],
			},
			{
				code: `
        import { screen } from '${testingFramework}';

        const dom = screen.queryByTestId('foo').${method}();
      `,
				errors: [
					{
						line: 4,
						column: 49,
						messageId: 'noNodeAccess',
					},
				],
			},
		]),
	]),
});
