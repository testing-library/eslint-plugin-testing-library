import rule, {
	Options,
	RULE_NAME,
} from '../../../lib/rules/await-async-events';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const FIRE_EVENT_ASYNC_FUNCTIONS = [
	'click',
	'change',
	'focus',
	'blur',
	'keyDown',
] as const;
const USER_EVENT_ASYNC_FUNCTIONS = [
	'click',
	'dblClick',
	'tripleClick',
	'hover',
	'unhover',
	'tab',
	'keyboard',
	'copy',
	'cut',
	'paste',
	'pointer',
	'clear',
	'deselectOptions',
	'selectOptions',
	'type',
	'upload',
] as const;
const FIRE_EVENT_ASYNC_FRAMEWORKS = [
	'@testing-library/vue',
	'@marko/testing-library',
] as const;
const USER_EVENT_ASYNC_FRAMEWORKS = ['@testing-library/user-event'] as const;

ruleTester.run(RULE_NAME, rule, {
	valid: [
		...FIRE_EVENT_ASYNC_FRAMEWORKS.flatMap((testingFramework) => [
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('event method not called is valid', () => {
          fireEvent.${eventMethod}
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('await promise from event method is valid', async () => {
          await fireEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('await several promises from event methods is valid', async () => {
          await fireEvent.${eventMethod}(getByLabelText('username'))
          await fireEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('await promise kept in a var from event method is valid', async () => {
          const promise = fireEvent.${eventMethod}(getByLabelText('username'))
          await promise
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('chain then method to promise from event method is valid', async (done) => {
          fireEvent.${eventMethod}(getByLabelText('username'))
            .then(() => { done() })
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('chain then method to several promises from event methods is valid', async (done) => {
          fireEvent.${eventMethod}(getByLabelText('username')).then(() => {
            fireEvent.${eventMethod}(getByLabelText('username')).then(() => { done() })
          })
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			{
				code: `
        import { fireEvent } from '${testingFramework}'
        test('event methods wrapped with Promise.all are valid', async () => {
          await Promise.all([
            fireEvent.${FIRE_EVENT_ASYNC_FUNCTIONS[0]}(getByText('Click me')),
            fireEvent.${FIRE_EVENT_ASYNC_FUNCTIONS[1]}(getByText('Click me')),
          ])
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			},
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('return promise from event methods is valid', () => {
          function triggerEvent() {
            doSomething()
            return fireEvent.${eventMethod}(getByLabelText('username'))
          }
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import { fireEvent } from '${testingFramework}'
        test('await promise returned from function wrapping event method is valid', () => {
          function triggerEvent() {
            doSomething()
            return fireEvent.${eventMethod}(getByLabelText('username'))
          }
  
          await triggerEvent()
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				settings: {
					'testing-library/utils-module': 'test-utils',
				},
				code: `
        import { fireEvent } from 'somewhere-else'
        test('unhandled promise from event not related to TL is valid', async () => {
          fireEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				settings: {
					'testing-library/utils-module': 'test-utils',
				},
				code: `
        import { fireEvent } from 'test-utils'
        test('await promise from event method imported from custom module is valid', async () => {
          await fireEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			})),
			{
				// edge case for coverage:
				// valid use case without call expression
				// so there is no innermost function scope found
				code: `
        import { fireEvent } from 'test-utils'
        test('edge case for innermost function without call expression', async () => {
          function triggerEvent() {
              doSomething()
              return fireEvent.focus(getByLabelText('username'))
            }
    
          const reassignedFunction = triggerEvent
        })
        `,
				options: [{ eventModule: 'fireEvent' }] as const,
			},
		]),

		...USER_EVENT_ASYNC_FRAMEWORKS.flatMap((testingFramework) => [
			{
				code: `
				import userEvent from '${testingFramework}'
				test('setup method called is valid', () => {
					userEvent.setup()
				})
				`,
				options: [{ eventModule: 'userEvent' }] as const,
			},
			{
				code: `
				import userEvent from '${testingFramework}'
				function customSetup() {
					return {
						user: userEvent.setup()
					};
				}
				test('setup method called and returned is valid', () => {
					const {user} = customSetup();
				})
				`,
				options: [{ eventModule: 'userEvent' }] as const,
			},
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('event method not called is valid', () => {
          userEvent.${eventMethod}
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('await promise from event method is valid', async () => {
          await userEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('await several promises from event methods is valid', async () => {
          await userEvent.${eventMethod}(getByLabelText('username'))
          await userEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('await promise kept in a var from event method is valid', async () => {
          const promise = userEvent.${eventMethod}(getByLabelText('username'))
          await promise
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('chain then method to promise from event method is valid', async (done) => {
          userEvent.${eventMethod}(getByLabelText('username'))
            .then(() => { done() })
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('chain then method to several promises from event methods is valid', async (done) => {
          userEvent.${eventMethod}(getByLabelText('username')).then(() => {
            userEvent.${eventMethod}(getByLabelText('username')).then(() => { done() })
          })
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			{
				code: `
        import userEvent from '${testingFramework}'
        test('event methods wrapped with Promise.all are valid', async () => {
          await Promise.all([
            userEvent.${USER_EVENT_ASYNC_FUNCTIONS[0]}(getByText('Click me')),
            userEvent.${USER_EVENT_ASYNC_FUNCTIONS[1]}(getByText('Click me')),
          ])
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			},
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('return promise from event methods is valid', () => {
          function triggerEvent() {
            doSomething()
            return userEvent.${eventMethod}(getByLabelText('username'))
          }
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('await promise returned from function wrapping event method is valid', () => {
          function triggerEvent() {
            doSomething()
            return userEvent.${eventMethod}(getByLabelText('username'))
          }
  
          await triggerEvent()
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				settings: {
					'testing-library/utils-module': 'test-utils',
				},
				code: `
        import userEvent from 'somewhere-else'
        test('unhandled promise from event not related to TL is valid', async () => {
          userEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				settings: {
					'testing-library/utils-module': 'test-utils',
				},
				code: `
        import userEvent from 'test-utils'
        test('await promise from event method imported from custom module is valid', async () => {
          await userEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			})),
			...USER_EVENT_ASYNC_FUNCTIONS.map((eventMethod) => ({
				code: `
        import userEvent from '${testingFramework}'
        test('await promise from userEvent relying on default options', async () => {
          await userEvent.${eventMethod}(getByLabelText('username'))
        })
        `,
			})),
			{
				// edge case for coverage:
				// valid use case without call expression
				// so there is no innermost function scope found
				code: `
        import userEvent from 'test-utils'
        test('edge case for innermost function without call expression', async () => {
          function triggerEvent() {
              doSomething()
              return userEvent.focus(getByLabelText('username'))
            }
    
          const reassignedFunction = triggerEvent
        })
        `,
				options: [{ eventModule: 'userEvent' }] as const,
			},
			{
				code: `
        import userEvent from '${USER_EVENT_ASYNC_FRAMEWORKS[0]}'
				import { fireEvent } from '${FIRE_EVENT_ASYNC_FRAMEWORKS[0]}'
        test('await promises from multiple event modules', async () => {
          await fireEvent.click(getByLabelText('username'))
          await userEvent.click(getByLabelText('username'))
        })
        `,
				options: [{ eventModule: ['userEvent', 'fireEvent'] }] as Options,
			},
		]),
	],

	invalid: [
		...FIRE_EVENT_ASYNC_FRAMEWORKS.flatMap((testingFramework) => [
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise from event method is invalid', () => {
        fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								endColumn: 19 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise from event method is invalid', async () => {
        await fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent } from '${testingFramework}'

      fireEvent.${eventMethod}(getByLabelText('username'))
      `,
						errors: [
							{
								line: 4,
								column: 7,
								endColumn: 17 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'

      fireEvent.${eventMethod}(getByLabelText('username'))
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent } from '${testingFramework}'

      function run() {
        fireEvent.${eventMethod}(getByLabelText('username'))
      }

      test('should handle external function', run)
      `,
						errors: [
							{
								line: 5,
								column: 9,
								endColumn: 19 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'

      async function run() {
        await fireEvent.${eventMethod}(getByLabelText('username'))
      }

      test('should handle external function', run)
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent as testingLibraryFireEvent } from '${testingFramework}'
      test('unhandled promise from aliased event method is invalid', async () => {
        testingLibraryFireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								endColumn: 33 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent as testingLibraryFireEvent } from '${testingFramework}'
      test('unhandled promise from aliased event method is invalid', async () => {
        await testingLibraryFireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import * as testingLibrary from '${testingFramework}'
      test('unhandled promise from wildcard imported event method is invalid', async () => {
        testingLibrary.fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								endColumn: 34 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import * as testingLibrary from '${testingFramework}'
      test('unhandled promise from wildcard imported event method is invalid', async () => {
        await testingLibrary.fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent } from '${testingFramework}'
      test('several unhandled promises from event methods is invalid', async function() {
        fireEvent.${eventMethod}(getByLabelText('username'))
        fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
							{
								line: 5,
								column: 9,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'
      test('several unhandled promises from event methods is invalid', async function() {
        await fireEvent.${eventMethod}(getByLabelText('username'))
        await fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						settings: {
							'testing-library/utils-module': 'test-utils',
						},
						code: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise from event method with aggressive reporting opted-out is invalid', function() {
        fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise from event method with aggressive reporting opted-out is invalid', async function() {
        await fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						settings: {
							'testing-library/utils-module': 'test-utils',
						},
						code: `
      import { fireEvent } from 'test-utils'
      test(
      'unhandled promise from event method imported from custom module with aggressive reporting opted-out is invalid',
      () => {
        fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 6,
								column: 9,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from 'test-utils'
      test(
      'unhandled promise from event method imported from custom module with aggressive reporting opted-out is invalid',
      async () => {
        await fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						settings: {
							'testing-library/utils-module': 'test-utils',
						},
						code: `
      import { fireEvent } from '${testingFramework}'
      test(
      'unhandled promise from event method imported from default module with aggressive reporting opted-out is invalid',
      () => {
        fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 6,
								column: 9,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'
      test(
      'unhandled promise from event method imported from default module with aggressive reporting opted-out is invalid',
      async () => {
        await fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),

			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent } from '${testingFramework}'
      test(
      'unhandled promise from event method kept in a var is invalid',
      () => {
        const promise = fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 6,
								column: 25,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'
      test(
      'unhandled promise from event method kept in a var is invalid',
      async () => {
        const promise = await fireEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise returned from function wrapping event method is invalid', () => {
        function triggerEvent() {
          doSomething()
          return fireEvent.${eventMethod}(getByLabelText('username'))
        }

        triggerEvent()
      })
      `,
						errors: [
							{
								line: 9,
								column: 9,
								messageId: 'awaitAsyncEventWrapper',
								data: { name: 'triggerEvent' },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise returned from function wrapping event method is invalid', async () => {
        function triggerEvent() {
          doSomething()
          return fireEvent.${eventMethod}(getByLabelText('username'))
        }

        await triggerEvent()
      })
      `,
					}) as const,
			),
			...FIRE_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import { fireEvent } from '${testingFramework}'

      function triggerEvent() {
        doSomething()
        return fireEvent.${eventMethod}(getByLabelText('username'))
      }

      triggerEvent()
      `,
						errors: [
							{
								line: 9,
								column: 7,
								messageId: 'awaitAsyncEventWrapper',
								data: { name: 'triggerEvent' },
							},
						],
						options: [{ eventModule: 'fireEvent' }],
						output: `
      import { fireEvent } from '${testingFramework}'

      function triggerEvent() {
        doSomething()
        return fireEvent.${eventMethod}(getByLabelText('username'))
      }

      triggerEvent()
      `,
					}) as const,
			),
		]),
		...USER_EVENT_ASYNC_FRAMEWORKS.flatMap((testingFramework) => [
			...USER_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import userEvent from '${testingFramework}'
      test('unhandled promise from event method is invalid', () => {
        userEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								endColumn: 19 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'userEvent' }],
						output: `
      import userEvent from '${testingFramework}'
      test('unhandled promise from event method is invalid', async () => {
        await userEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...USER_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import userEvent from '${testingFramework}'
			
      userEvent.${eventMethod}(getByLabelText('username'))
      `,
						errors: [
							{
								line: 4,
								column: 7,
								endColumn: 17 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'userEvent' }],
						output: `
      import userEvent from '${testingFramework}'
			
      userEvent.${eventMethod}(getByLabelText('username'))
      `,
					}) as const,
			),
			...USER_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import testingLibraryUserEvent from '${testingFramework}'
      test('unhandled promise imported from alternate name event method is invalid', () => {
        testingLibraryUserEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								endColumn: 33 + eventMethod.length,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'userEvent' }],
						output: `
      import testingLibraryUserEvent from '${testingFramework}'
      test('unhandled promise imported from alternate name event method is invalid', async () => {
        await testingLibraryUserEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...USER_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import userEvent from '${testingFramework}'
      test('several unhandled promises from event methods is invalid', () => {
        userEvent.${eventMethod}(getByLabelText('username'))
        userEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 4,
								column: 9,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
							{
								line: 5,
								column: 9,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'userEvent' }],
						output: `
      import userEvent from '${testingFramework}'
      test('several unhandled promises from event methods is invalid', async () => {
        await userEvent.${eventMethod}(getByLabelText('username'))
        await userEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...USER_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import userEvent from '${testingFramework}'
      test(
      'unhandled promise from event method kept in a var is invalid',
      () => {
        const promise = userEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
						errors: [
							{
								line: 6,
								column: 25,
								messageId: 'awaitAsyncEvent',
								data: { name: eventMethod },
							},
						],
						options: [{ eventModule: 'userEvent' }],
						output: `
      import userEvent from '${testingFramework}'
      test(
      'unhandled promise from event method kept in a var is invalid',
      async () => {
        const promise = await userEvent.${eventMethod}(getByLabelText('username'))
      })
      `,
					}) as const,
			),
			...USER_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import userEvent from '${testingFramework}'
      test('unhandled promise returned from function wrapping event method is invalid', function() {
        function triggerEvent() {
          doSomething()
          return userEvent.${eventMethod}(getByLabelText('username'))
        }

        triggerEvent()
      })
      `,
						errors: [
							{
								line: 9,
								column: 9,
								messageId: 'awaitAsyncEventWrapper',
								data: { name: 'triggerEvent' },
							},
						],
						options: [{ eventModule: 'userEvent' }],
						output: `
      import userEvent from '${testingFramework}'
      test('unhandled promise returned from function wrapping event method is invalid', async function() {
        function triggerEvent() {
          doSomething()
          return userEvent.${eventMethod}(getByLabelText('username'))
        }

        await triggerEvent()
      })
      `,
					}) as const,
			),
			...USER_EVENT_ASYNC_FUNCTIONS.map(
				(eventMethod) =>
					({
						code: `
      import userEvent from '${testingFramework}'

      function triggerEvent() {
        doSomething()
        return userEvent.${eventMethod}(getByLabelText('username'))
      }

      triggerEvent()
      `,
						errors: [
							{
								line: 9,
								column: 7,
								messageId: 'awaitAsyncEventWrapper',
								data: { name: 'triggerEvent' },
							},
						],
						options: [{ eventModule: 'userEvent' }],
						output: `
      import userEvent from '${testingFramework}'

      function triggerEvent() {
        doSomething()
        return userEvent.${eventMethod}(getByLabelText('username'))
      }

      triggerEvent()
      `,
					}) as const,
			),
		]),
		{
			code: `
      import userEvent from '${USER_EVENT_ASYNC_FRAMEWORKS[0]}'
      import { fireEvent } from '${FIRE_EVENT_ASYNC_FRAMEWORKS[0]}'
      test('unhandled promises from multiple event modules', () => {
        fireEvent.click(getByLabelText('username'))
        userEvent.click(getByLabelText('username'))
      })
      `,
			errors: [
				{
					line: 5,
					column: 9,
					messageId: 'awaitAsyncEvent',
					data: { name: 'click' },
				},
				{
					line: 6,
					column: 9,
					messageId: 'awaitAsyncEvent',
					data: { name: 'click' },
				},
			],
			options: [{ eventModule: ['userEvent', 'fireEvent'] }] as Options,
			output: `
      import userEvent from '${USER_EVENT_ASYNC_FRAMEWORKS[0]}'
      import { fireEvent } from '${FIRE_EVENT_ASYNC_FRAMEWORKS[0]}'
      test('unhandled promises from multiple event modules', async () => {
        await fireEvent.click(getByLabelText('username'))
        await userEvent.click(getByLabelText('username'))
      })
      `,
		},
		{
			code: `
      import userEvent from '${USER_EVENT_ASYNC_FRAMEWORKS[0]}'
      import { fireEvent } from '${FIRE_EVENT_ASYNC_FRAMEWORKS[0]}'
			test('unhandled promise from userEvent relying on default options', async function() {
        fireEvent.click(getByLabelText('username'))
        userEvent.click(getByLabelText('username'))
      })
      `,
			errors: [
				{
					line: 6,
					column: 9,
					messageId: 'awaitAsyncEvent',
					data: { name: 'click' },
				},
			],
			output: `
      import userEvent from '${USER_EVENT_ASYNC_FRAMEWORKS[0]}'
      import { fireEvent } from '${FIRE_EVENT_ASYNC_FRAMEWORKS[0]}'
			test('unhandled promise from userEvent relying on default options', async function() {
        fireEvent.click(getByLabelText('username'))
        await userEvent.click(getByLabelText('username'))
      })
      `,
		},
	],
});
