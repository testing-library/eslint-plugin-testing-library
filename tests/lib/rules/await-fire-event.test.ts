import rule, { RULE_NAME } from '../../../lib/rules/await-fire-event';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const COMMON_FIRE_EVENT_METHODS: string[] = [
	'click',
	'change',
	'focus',
	'blur',
	'keyDown',
];
const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/vue',
	'@marko/testing-library',
];

ruleTester.run(RULE_NAME, rule, {
	valid: SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('fire event method not called is valid', () => {
          fireEvent.${fireEventMethod}
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('await promise from fire event method is valid', async () => {
          await fireEvent.${fireEventMethod}(getByLabelText('username'))
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('await several promises from fire event methods is valid', async () => {
          await fireEvent.${fireEventMethod}(getByLabelText('username'))
          await fireEvent.${fireEventMethod}(getByLabelText('username'))
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('await promise kept in a var from fire event method is valid', async () => {
          const promise = fireEvent.${fireEventMethod}(getByLabelText('username'))
          await promise
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('chain then method to promise from fire event method is valid', async (done) => {
          fireEvent.${fireEventMethod}(getByLabelText('username'))
            .then(() => { done() })
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('chain then method to several promises from fire event methods is valid', async (done) => {
          fireEvent.${fireEventMethod}(getByLabelText('username')).then(() => {
            fireEvent.${fireEventMethod}(getByLabelText('username')).then(() => { done() })
          })
        })
        `,
		})),
		{
			code: `
        import { fireEvent } from '${testingFramework}'
        test('fireEvent methods wrapped with Promise.all are valid', async () => {
          await Promise.all([
            fireEvent.blur(getByText('Click me')),
            fireEvent.click(getByText('Click me')),
          ])
        })
        `,
		},
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('return promise from fire event methods is valid', () => {
          function triggerEvent() {
            doSomething()
            return fireEvent.${fireEventMethod}(getByLabelText('username'))
          }
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			code: `
        import { fireEvent } from '${testingFramework}'
        test('await promise returned from function wrapping fire event method is valid', () => {
          function triggerEvent() {
            doSomething()
            return fireEvent.${fireEventMethod}(getByLabelText('username'))
          }
  
          await triggerEvent()
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent } from 'somewhere-else'
        test('unhandled promise from fire event not related to TL is valid', async () => {
          fireEvent.${fireEventMethod}(getByLabelText('username'))
        })
        `,
		})),
		...COMMON_FIRE_EVENT_METHODS.map((fireEventMethod) => ({
			settings: {
				'testing-library/utils-module': 'test-utils',
			},
			code: `
        import { fireEvent } from 'test-utils'
        test('await promise from fire event method imported from custom module is valid', async () => {
          await fireEvent.${fireEventMethod}(getByLabelText('username'))
        })
        `,
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
		},
	]),

	invalid: SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) => [
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					code: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise from fire event method is invalid', async () => {
        fireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 4,
							column: 9,
							endColumn: 19 + fireEventMethod.length,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					code: `
      import { fireEvent as testingLibraryFireEvent } from '${testingFramework}'
      test('unhandled promise from aliased fire event method is invalid', async () => {
        testingLibraryFireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 4,
							column: 9,
							endColumn: 33 + fireEventMethod.length,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					code: `
      import * as testingLibrary from '${testingFramework}'
      test('unhandled promise from wildcard imported fire event method is invalid', async () => {
        testingLibrary.fireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 4,
							column: 9,
							endColumn: 34 + fireEventMethod.length,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					code: `
      import { fireEvent } from '${testingFramework}'
      test('several unhandled promises from fire event methods is invalid', async () => {
        fireEvent.${fireEventMethod}(getByLabelText('username'))
        fireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 4,
							column: 9,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
						{
							line: 5,
							column: 9,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise from fire event method with aggressive reporting opted-out is invalid', async () => {
        fireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 4,
							column: 9,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `
      import { fireEvent } from 'test-utils'
      test(
      'unhandled promise from fire event method imported from custom module with aggressive reporting opted-out is invalid',
      () => {
        fireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 6,
							column: 9,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					settings: {
						'testing-library/utils-module': 'test-utils',
					},
					code: `
      import { fireEvent } from '${testingFramework}'
      test(
      'unhandled promise from fire event method imported from default module with aggressive reporting opted-out is invalid',
      () => {
        fireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 6,
							column: 9,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),

		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					code: `
      import { fireEvent } from '${testingFramework}'
      test(
      'unhandled promise from fire event method kept in a var is invalid',
      () => {
        const promise = fireEvent.${fireEventMethod}(getByLabelText('username'))
      })
      `,
					errors: [
						{
							line: 6,
							column: 25,
							messageId: 'awaitFireEvent',
							data: { name: fireEventMethod },
						},
					],
				} as const)
		),
		...COMMON_FIRE_EVENT_METHODS.map(
			(fireEventMethod) =>
				({
					code: `
      import { fireEvent } from '${testingFramework}'
      test('unhandled promise returned from function wrapping fire event method is invalid', () => {
        function triggerEvent() {
          doSomething()
          return fireEvent.${fireEventMethod}(getByLabelText('username'))
        }

        triggerEvent()
      })
      `,
					errors: [
						{
							line: 9,
							column: 9,
							messageId: 'fireEventWrapper',
							data: { name: 'triggerEvent' },
						},
					],
				} as const)
		),
	]),
});
