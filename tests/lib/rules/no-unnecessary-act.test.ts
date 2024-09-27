import { type TSESLint } from '@typescript-eslint/utils';

import rule, {
	MessageIds,
	Options,
	RULE_NAME,
} from '../../../lib/rules/no-unnecessary-act';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

type ValidTestCase = TSESLint.ValidTestCase<Options>;
type InvalidTestCase = TSESLint.InvalidTestCase<MessageIds, Options>;
type TestCase = InvalidTestCase | ValidTestCase;

const addOptions = <T extends TestCase>(
	array: T[],
	options?: Options[number]
): T[] =>
	array.map((testCase) => ({
		...testCase,
		options: [options],
	}));
const disableStrict = <T extends TestCase>(array: T[]): T[] =>
	addOptions(array, { isStrict: false });
const enableStrict = <T extends TestCase>(array: T[]): T[] =>
	addOptions(array, { isStrict: true });

/**
 * - AGR stands for Aggressive Reporting
 * - RTL stands for React Testing Library (@testing-library/react)
 * - Marko TL stands for Marko Testing Library (@marko/testing-library)
 * - RTU stands for React Test Utils (react-dom/test-utils)
 */
const SUPPORTED_TESTING_FRAMEWORKS = [
	['@testing-library/react', 'RTL'],
	['@marko/testing-library', 'Marko TL'],
];

const validNonStrictTestCases: ValidTestCase[] = [
	{
		code: `// case: RTL act wrapping both RTL and non-RTL calls
      import { act, render, waitFor } from '@testing-library/react'

      test('valid case', async () => {
        act(() => {
          render(element);
          stuffThatDoesNotUseRTL();
        });

        await act(async () => {
          waitFor();
          stuffThatDoesNotUseRTL();
        });

        act(function() {
          waitFor();
          stuffThatDoesNotUseRTL();
        });
      });
      `,
	},
];

const validTestCases: ValidTestCase[] = [
	...SUPPORTED_TESTING_FRAMEWORKS.map(([testingFramework, shortName]) => ({
		code: `// case: ${shortName} act wrapping non-${shortName} calls
    import { act } from '${testingFramework}'

    test('valid case', async () => {
      act(() => {
        stuffThatDoesNotUseRTL();
      });

      act(function() {
        a = stuffThatDoesNotUseRTL();
      });

      act(function() {
        a = await stuffThatDoesNotUseRTL();
      });

      await act(async () => {
        await stuffThatDoesNotUseRTL();
      });

      await act(async () => {
        await stuffThatDoesNotUseRTL;
      });

      await act(() => stuffThatDoesNotUseRTL);

      act(() => stuffThatDoesNotUseRTL);

      act(() => {
        return stuffThatDoesNotUseRTL
      });

      act(async function() {
        await stuffThatDoesNotUseRTL;
      });

      await act(async function() {
        await stuffThatDoesNotUseRTL;
      });

      act(async function() {
        return stuffThatDoesNotUseRTL;
      });

      act(function() {
        stuffThatDoesNotUseRTL();
        const a = foo();
      });

      act(function() {
        return stuffThatDoesNotUseRTL();
      });

      act(() => stuffThatDoesNotUseRTL());

      act(() => stuffThatDoesNotUseRTL()).then(() => {})
      act(stuffThatDoesNotUseRTL().then(() => {}))
    });
    `,
	})),
	{
		code: `// case: RTU act wrapping non-RTL
      import { act } from 'react-dom/test-utils'

      test('valid case', async () => {
        act(() => {
          stuffThatDoesNotUseRTL();
        });

        await act(async () => {
          stuffThatDoesNotUseRTL();
        });

        act(function() {
          stuffThatDoesNotUseRTL();
        });

        act(function() {
          return stuffThatDoesNotUseRTL();
        });

        act(() => stuffThatDoesNotUseRTL());
      });
      `,
	},
	...SUPPORTED_TESTING_FRAMEWORKS.map(([testingFramework, shortName]) => ({
		settings: {
			'testing-library/utils-module': 'test-utils',
		},
		code: `// case: ${shortName} act wrapping non-${shortName} - AGR disabled
      import { act } from '${testingFramework}'
      import { waitFor } from 'somewhere-else'

      test('valid case', async () => {
        act(() => {
          waitFor();
        });

        await act(async () => {
          waitFor();
        });

        act(function() {
          waitFor();
        });

        act(function() {
          return waitFor();
        });

        act(() => waitFor());
      });
      `,
	})),

	...SUPPORTED_TESTING_FRAMEWORKS.map(([testingFramework, shortName]) => ({
		settings: {
			'testing-library/utils-module': 'test-utils',
		},
		code: `// case: non-${shortName} act wrapping ${shortName} - AGR disabled
      import { act } from 'somewhere-else'
      import { waitFor } from '${testingFramework}'

      test('valid case', async () => {
        act(() => {
          waitFor();
        });

        await act(async () => {
          waitFor();
        });

        act(function() {
          waitFor();
        });

        act(function() {
          return waitFor();
        });

        act(() => waitFor());

        act(() => {})
        await act(async () => {})
        act(function() {})
      });
      `,
	})),
];

const invalidStrictTestCases: InvalidTestCase[] =
	SUPPORTED_TESTING_FRAMEWORKS.flatMap(([testingFramework, shortName]) => [
		{
			code: `// case: ${shortName} act wrapping both ${shortName} and non-${shortName} calls with strict option
      import { act, render } from '${testingFramework}'

      await act(async () => {
        userEvent.click(screen.getByText("Submit"))
        await flushPromises()
      })
      act(function() {
        userEvent.click(screen.getByText("Submit"))
        flushPromises()
      })
      `,
			errors: [
				{
					messageId: 'noUnnecessaryActTestingLibraryUtil',
					line: 4,
					column: 13,
				},
				{
					messageId: 'noUnnecessaryActTestingLibraryUtil',
					line: 8,
					column: 7,
				},
			],
		},
	]);

const invalidTestCases: InvalidTestCase[] = [
	...SUPPORTED_TESTING_FRAMEWORKS.map(
		([testingFramework, shortName]) =>
			({
				code: `// case: ${shortName} act wrapping ${shortName} calls - callbacks with body (BlockStatement)
      import { act, fireEvent, screen, render, waitFor, waitForElementToBeRemoved } from '${testingFramework}'
      import userEvent from '@testing-library/user-event'

      test('invalid case', async () => {
        act(() => {
          fireEvent.click(el);
        });

        await act(async () => {
          waitFor(() => {});
        });

        await act(async () => {
          waitForElementToBeRemoved(el);
        });

        act(function() {
          const blah = screen.getByText('blah');
        });

        act(function() {
          render(something);
        });

        await act(() => {
          const button = findByRole('button')
        });

        act(() => {
          userEvent.click(el)
        });

        act(() => {
          waitFor();
          const element = screen.getByText('blah');
          userEvent.click(element)
        });
      });
      `,
				errors: [
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 6,
						column: 9,
					},
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 10,
						column: 15,
					},
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 14,
						column: 15,
					},
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 18,
						column: 9,
					},
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 22,
						column: 9,
					},
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 26,
						column: 15,
					},
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 30,
						column: 9,
					},
					{
						messageId: 'noUnnecessaryActTestingLibraryUtil',
						line: 34,
						column: 9,
					},
				],
			}) as const
	),
	{
		settings: {
			'testing-library/utils-module': 'test-utils',
		},
		code: `// case: RTL act wrapping RTL calls - callbacks with body (BlockStatement) - AGR disabled
      import { act, fireEvent, screen, render, waitFor, waitForElementToBeRemoved } from 'test-utils'
      import userEvent from '@testing-library/user-event'

      test('invalid case', async () => {
        act(() => {
          fireEvent.click(el);
        });

        await act(async () => {
          waitFor(() => {});
        });

        await act(async () => {
          waitForElementToBeRemoved(el);
        });

        act(function() {
          const blah = screen.getByText('blah');
        });

        act(function() {
          render(something);
        });

        await act(() => {
          const button = findByRole('button')
        });

        act(() => {
          userEvent.click(el)
        });

        act(() => {
          waitFor();
          const element = screen.getByText('blah');
          userEvent.click(element)
        });
      });
      `,
		errors: [
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 6, column: 9 },
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 10,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 14,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 18,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 22,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 26,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 30,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 34,
				column: 9,
			},
		],
	},
	{
		code: `// case: RTL act wrapping RTL calls - callbacks with return
      import { act, fireEvent, screen, render, waitFor } from '@testing-library/react'
      import userEvent from '@testing-library/user-event'

      test('invalid case', async () => {
        act(() => fireEvent.click(el))
        act(() => screen.getByText('blah'))
        act(() => findByRole('button'))
        act(() => userEvent.click(el))
        await act(async () => userEvent.type('hi', el))
        act(() => render(foo))
        await act(async () => render(fo))
        act(() => waitFor(() => {}))
        await act(async () => waitFor(() => {}))

        act(function () {
          return fireEvent.click(el);
        });
        act(function () {
          return screen.getByText('blah');
        });
        act(function () {
          return findByRole('button');
        });
        act(function () {
          return userEvent.click(el);
        });
        await act(async function () {
          return userEvent.type('hi', el);
        });
        act(function () {
          return render(foo);
        });
        await act(async function () {
          return render(fo);
        });
        act(function () {
          return waitFor(() => {});
        });
        await act(async function () {
          return waitFor(() => {});
        });
        act(async function () {
          return waitFor(() => {});
        }).then(() => {})
      });
      `,
		errors: [
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 6, column: 9 },
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 7, column: 9 },
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 8, column: 9 },
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 9, column: 9 },
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 10,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 11,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 12,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 13,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 14,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 16,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 19,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 22,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 25,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 28,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 31,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 34,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 37,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 40,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 43,
				column: 9,
			},
		],
	},
	{
		code: `// case: RTL act wrapping empty callback
      import { act } from '@testing-library/react'

      test('invalid case', async () => {
        await act(async () => {})
        act(() => {})
        await act(async function () {})
        act(function () {})
      })
      `,
		errors: [
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 5, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 6, column: 9 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 7, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 8, column: 9 },
		],
	},
	{
		settings: {
			'testing-library/utils-module': 'test-utils',
		},
		code: `// case: RTL act wrapping empty callback - require version
      const { act } = require('@testing-library/react');

      test('invalid case', async () => {
        await act(async () => {})
        act(() => {})
        await act(async function () {})
        act(function () {})
        act(function () {}).then(() => {})
      })
      `,
		errors: [
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 5, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 6, column: 9 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 7, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 8, column: 9 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 9, column: 9 },
		],
	},

	// cases for act related to React Test Utils
	{
		settings: {
			'testing-library/utils-module': 'custom-testing-module',
		},
		code: `// case: RTU act wrapping RTL calls - callbacks with body (BlockStatement)
      import { act } from 'react-dom/test-utils';
      import { fireEvent, screen, render, waitFor, waitForElementToBeRemoved } from 'custom-testing-module'
      import userEvent from '@testing-library/user-event'

      test('invalid case', async () => {
        act(() => {
          fireEvent.click(el);
        });

        await act(async () => {
          waitFor(() => {});
        });

        await act(async () => {
          waitForElementToBeRemoved(el);
        });

        act(function() {
          const blah = screen.getByText('blah');
        });

        act(function() {
          render(something);
        });

        await act(() => {
          const button = findByRole('button')
        });

        act(() => {
          userEvent.click(el)
        });

        act(() => {
          waitFor();
          const element = screen.getByText('blah');
          userEvent.click(element)
        });
      });
      `,
		errors: [
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 7, column: 9 },
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 11,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 15,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 19,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 23,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 27,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 31,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 35,
				column: 9,
			},
		],
	},
	{
		settings: {
			'testing-library/utils-module': 'custom-testing-module',
		},
		code: `// case: RTU act wrapping RTL calls - callbacks with return
      import { act } from 'react-dom/test-utils';
      import { fireEvent, screen, render, waitFor } from 'custom-testing-module'
      import userEvent from '@testing-library/user-event'

      test('invalid case', async () => {
        act(() => fireEvent.click(el))
        act(() => screen.getByText('blah'))
        act(() => findByRole('button'))
        act(() => userEvent.click(el))
        await act(async () => userEvent.type('hi', el))
        act(() => render(foo))
        await act(async () => render(fo))
        act(() => waitFor(() => {}))
        await act(async () => waitFor(() => {}))

        act(function () {
          return fireEvent.click(el);
        });
        act(function () {
          return screen.getByText('blah');
        });
        act(function () {
          return findByRole('button');
        });
        act(function () {
          return userEvent.click(el);
        });
        await act(async function () {
          return userEvent.type('hi', el);
        });
        act(function () {
          return render(foo);
        });
        await act(async function () {
          return render(fo);
        });
        act(function () {
          return waitFor(() => {});
        });
        await act(async function () {
          return waitFor(() => {});
        });
      });
      `,
		errors: [
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 7, column: 9 },
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 8, column: 9 },
			{ messageId: 'noUnnecessaryActTestingLibraryUtil', line: 9, column: 9 },
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 10,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 11,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 12,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 13,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 14,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 15,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 17,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 20,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 23,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 26,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 29,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 32,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 35,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 38,
				column: 9,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 41,
				column: 15,
			},
		],
	},
	{
		settings: {
			'testing-library/utils-module': 'off',
		},
		code: `// case: RTU act wrapping empty callback
      import { act } from 'react-dom/test-utils';
      import { render } from '@testing-library/react'

      test('invalid case', async () => {
        render(element);
        await act(async () => {});
        act(() => {});
        await act(async function () {});
        act(function () {});
      });
      `,
		errors: [
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 7, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 8, column: 9 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 9, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 10, column: 9 },
		],
	},
	{
		settings: {
			'testing-library/utils-module': 'off',
		},
		code: `// case: RTU act wrapping empty callback - require version
      const { act } = require('react-dom/test-utils');
      const { render } = require('@testing-library/react');

      test('invalid case', async () => {
        render(element);
        await act(async () => {});
        act(() => {});
        await act(async function () {});
        act(function () {});
      })
      `,
		errors: [
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 7, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 8, column: 9 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 9, column: 15 },
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 10, column: 9 },
		],
	},

	{
		settings: {
			'testing-library/utils-module': 'custom-testing-module',
			'testing-library/custom-renders': 'off',
		},
		code: `// case: mixed scenarios - AGR disabled
      import * as ReactTestUtils from 'react-dom/test-utils';
      import { act as renamedAct, fireEvent, screen as renamedScreen, render, waitFor } from 'custom-testing-module'
      import userEvent from '@testing-library/user-event'
      import { act, waitForElementToBeRemoved } from 'somewhere-else'

      test('invalid case', async () => {
        ReactTestUtils.act(() => {})
        await ReactTestUtils.act(() => render())
        await renamedAct(async () => waitFor())
        renamedAct(function() { renamedScreen.findByRole('button') })

        // these are valid
        await renamedAct(() => waitForElementToBeRemoved(element))
        act(() => {})
        await act(async () => { userEvent.click(element) })
        act(function() { return renamedScreen.getByText('foo') })
      });
      `,
		errors: [
			{ messageId: 'noUnnecessaryActEmptyFunction', line: 8, column: 24 },
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 9,
				column: 30,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 10,
				column: 15,
			},
			{
				messageId: 'noUnnecessaryActTestingLibraryUtil',
				line: 11,
				column: 9,
			},
		],
	},
];

ruleTester.run(RULE_NAME, rule, {
	valid: [
		...validTestCases,
		...disableStrict(validNonStrictTestCases),
		...disableStrict(validTestCases),
	],
	invalid: [
		...invalidTestCases,
		...enableStrict(invalidStrictTestCases),
		...disableStrict(invalidTestCases),
	],
});
