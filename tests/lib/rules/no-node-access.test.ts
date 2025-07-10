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
	valid: SUPPORTED_TESTING_FRAMEWORKS.flatMap<RuleValidTestCase>(
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

        const buttonText = screen.getByText('submit');
				userEvent.setup().click(buttonText);
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
				code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
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
		]
	),
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

        const button = document.getElementById('submit-btn').${method}();
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
				settings: { 'testing-library/utils-module': 'test-utils' },
				code: `
				// case: custom module set but not imported using ${testingFramework} (aggressive reporting limited)
        import { screen } from 'test-utils';

        const button = document.getElementById('submit-btn').${method}();
      `,
				errors: [
					{
						line: 5,
						column: 33,
						messageId: 'noNodeAccess',
					},
					{
						line: 5,
						column: 62,
						messageId: 'noNodeAccess',
					},
				],
			},
		]),
	]),
});
