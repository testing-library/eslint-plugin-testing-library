import rule, { RULE_NAME } from '../../../lib/rules/no-await-sync-events';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const FIRE_EVENT_FUNCTIONS = [
	'copy',
	'cut',
	'paste',
	'compositionEnd',
	'compositionStart',
	'compositionUpdate',
	'keyDown',
	'keyPress',
	'keyUp',
	'focus',
	'blur',
	'focusIn',
	'focusOut',
	'change',
	'input',
	'invalid',
	'submit',
	'reset',
	'click',
	'contextMenu',
	'dblClick',
	'drag',
	'dragEnd',
	'dragEnter',
	'dragExit',
	'dragLeave',
	'dragOver',
	'dragStart',
	'drop',
	'mouseDown',
	'mouseEnter',
	'mouseLeave',
	'mouseMove',
	'mouseOut',
	'mouseOver',
	'mouseUp',
	'popState',
	'select',
	'touchCancel',
	'touchEnd',
	'touchMove',
	'touchStart',
	'scroll',
	'wheel',
	'abort',
	'canPlay',
	'canPlayThrough',
	'durationChange',
	'emptied',
	'encrypted',
	'ended',
	'loadedData',
	'loadedMetadata',
	'loadStart',
	'pause',
	'play',
	'playing',
	'progress',
	'rateChange',
	'seeked',
	'seeking',
	'stalled',
	'suspend',
	'timeUpdate',
	'volumeChange',
	'waiting',
	'load',
	'error',
	'animationStart',
	'animationEnd',
	'animationIteration',
	'transitionEnd',
	'doubleClick',
	'pointerOver',
	'pointerEnter',
	'pointerDown',
	'pointerMove',
	'pointerUp',
	'pointerCancel',
	'pointerOut',
	'pointerLeave',
	'gotPointerCapture',
	'lostPointerCapture',
];
const SUPPORTED_TESTING_FRAMEWORKS = [
	'@testing-library/dom',
	'@testing-library/angular',
	'@testing-library/react',
	'@testing-library/vue',
	'@marko/testing-library',
];
const USER_EVENT_SYNC_FUNCTIONS = [
	'clear',
	'click',
	'dblClick',
	'selectOptions',
	'deselectOptions',
	'upload',
	// 'type',
	// 'keyboard',
	'tab',
	'paste',
	'hover',
	'unhover',
];

ruleTester.run(RULE_NAME, rule, {
	valid: [
		// sync fireEvents methods without await are valid
		...FIRE_EVENT_FUNCTIONS.map((func) => ({
			code: `() => {
        fireEvent.${func}('foo')
      }
      `,
		})),
		// sync userEvent methods without await are valid
		...USER_EVENT_SYNC_FUNCTIONS.map((func) => ({
			code: `() => {
        userEvent.${func}('foo')
      }
      `,
		})),
		{
			code: `() => {
        userEvent.type(element, 'foo')
      }
      `,
		},
		{
			code: `() => {
        userEvent.keyboard('foo')
      }
      `,
		},
		{
			code: `() => {
        await userEvent.type(element, 'bar', {delay: 1234})
      }
      `,
		},
		{
			code: `() => {
        await userEvent.keyboard('foo', {delay: 1234})
      }
      `,
		},
		{
			code: `async() => {
		const delay = 10
        await userEvent.keyboard('foo', {delay})
      }
      `,
		},
		{
			code: `async() => {
		const delay = 10
        await userEvent.type(element, text, {delay})
      }
      `,
		},
		{
			code: `async() => {
		let delay = 0
        delay = 10
        await userEvent.type(element, text, {delay})
      }
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { fireEvent } from 'somewhere-else';
        test('should not report fireEvent.click() not related to Testing Library', async() => {
          await fireEvent.click('foo');
        });
      `,
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { fireEvent as renamedFireEvent } from 'somewhere-else';
        import renamedUserEvent from '@testing-library/user-event';
        import { fireEvent, userEvent } from 'somewhere-else'
        
        test('should not report unused renamed methods', async() => {
          await fireEvent.click('foo');
          await userEvent.type('foo', 'bar', { delay: 5 });
          await userEvent.keyboard('foo', { delay: 5 });
        });
      `,
		},

		// valid tests for fire-event when only user-event set in eventModules
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) =>
			FIRE_EVENT_FUNCTIONS.map((func) => ({
				code: `
          import { fireEvent } from '${testingFramework}';
          test('should not report fireEvent.${func} sync event awaited', async() => {
            await fireEvent.${func}('foo');
          });
        `,
				options: [{ eventModules: ['user-event'] }],
			}))
		),

		// valid tests for user-event when only fire-event set in eventModules
		...USER_EVENT_SYNC_FUNCTIONS.map((func) => ({
			code: `
        import userEvent from '@testing-library/user-event';
        test('should not report userEvent.${func} sync event awaited', async() => {
          await userEvent.${func}('foo');
        });
      `,
			options: [{ eventModules: ['fire-event'] }],
		})),

		// valid tests for user-event with default options (user-event disabled)
		...USER_EVENT_SYNC_FUNCTIONS.map((func) => ({
			code: `
        import userEvent from '@testing-library/user-event';
        test('should not report userEvent.${func} by default', async() => {
          await userEvent.${func}('foo');
        });
      `,
		})),
	],

	invalid: [
		// sync fireEvent methods with await operator are not valid
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) =>
			FIRE_EVENT_FUNCTIONS.map(
				(func) =>
					({
						code: `
        import { fireEvent } from '${testingFramework}';
        test('should report fireEvent.${func} sync event awaited', async() => {
          await fireEvent.${func}('foo');
        });
      `,
						errors: [
							{
								line: 4,
								column: 17,
								messageId: 'noAwaitSyncEvents',
								data: { name: `fireEvent.${func}` },
							},
						],
					} as const)
			)
		),
		// sync userEvent sync methods with await operator are not valid
		...USER_EVENT_SYNC_FUNCTIONS.map(
			(func) =>
				({
					code: `
        import userEvent from '@testing-library/user-event';
        test('should report userEvent.${func} sync event awaited', async() => {
          await userEvent.${func}('foo');
        });
      `,
					options: [{ eventModules: ['user-event'] }],
					errors: [
						{
							line: 4,
							column: 17,
							messageId: 'noAwaitSyncEvents',
							data: { name: `userEvent.${func}` },
						},
					],
				} as const)
		),

		// sync fireEvent methods with await operator are not valid
		// when only fire-event set in eventModules
		...SUPPORTED_TESTING_FRAMEWORKS.flatMap((testingFramework) =>
			FIRE_EVENT_FUNCTIONS.map(
				(func) =>
					({
						code: `
        import { fireEvent } from '${testingFramework}';
        test('should report fireEvent.${func} sync event awaited', async() => {
          await fireEvent.${func}('foo');
        });
      `,
						errors: [
							{
								line: 4,
								column: 17,
								messageId: 'noAwaitSyncEvents',
								data: { name: `fireEvent.${func}` },
							},
						],
					} as const)
			)
		),

		...USER_EVENT_SYNC_FUNCTIONS.map(
			(func) =>
				({
					code: `
        import userEvent from '@testing-library/user-event';
        test('should report userEvent.${func} sync event awaited', async() => {
          await userEvent.${func}('foo');
        });
      `,
					options: [{ eventModules: ['user-event'] }],
					errors: [
						{
							line: 4,
							column: 17,
							messageId: 'noAwaitSyncEvents',
							data: { name: `userEvent.${func}` },
						},
					],
				} as const)
		),

		{
			code: `
        import userEvent from '@testing-library/user-event';
        test('should report async events without delay awaited', async() => {
          await userEvent.type('foo', 'bar');
          await userEvent.keyboard('foo');
        });
      `,
			options: [{ eventModules: ['user-event'] }],
			errors: [
				{
					line: 4,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'userEvent.type' },
				},
				{
					line: 5,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'userEvent.keyboard' },
				},
			],
		},
		{
			code: `
        import userEvent from '@testing-library/user-event';
        test('should report async events with 0 delay awaited', async() => {
          await userEvent.type('foo', 'bar', { delay: 0 });
          await userEvent.keyboard('foo', { delay: 0 });
        });
      `,
			options: [{ eventModules: ['user-event'] }],
			errors: [
				{
					line: 4,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'userEvent.type' },
				},
				{
					line: 5,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'userEvent.keyboard' },
				},
			],
		},
		{
			settings: { 'testing-library/utils-module': 'test-utils' },
			code: `
        import { fireEvent as renamedFireEvent } from 'test-utils';
        import renamedUserEvent from '@testing-library/user-event';
        
        test('should report renamed invalid cases with Aggressive Reporting disabled', async() => {
          await renamedFireEvent.click('foo');
          await renamedUserEvent.type('foo', 'bar', { delay: 0 });
          await renamedUserEvent.keyboard('foo', { delay: 0 });
        });
      `,
			options: [{ eventModules: ['user-event', 'fire-event'] }],
			errors: [
				{
					line: 6,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'renamedFireEvent.click' },
				},
				{
					line: 7,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'renamedUserEvent.type' },
				},
				{
					line: 8,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'renamedUserEvent.keyboard' },
				},
			],
		},
		{
			code: `async() => {
          const delay = 0
          await userEvent.type('foo', { delay });
        }
      `,
			options: [{ eventModules: ['user-event'] }],
			errors: [
				{
					line: 3,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'userEvent.type' },
				},
			],
		},
		{
			code: `async() => {
          const delay = 0
		  const somethingElse = true
		  const skipHover = true
          await userEvent.type('foo', { delay, skipHover });
        }
      `,
			options: [{ eventModules: ['user-event'] }],
			errors: [
				{
					line: 5,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'userEvent.type' },
				},
			],
		},
		{
			code: `async() => {
		  let delay = 0
		  const somethingElse = true
		  const skipHover = true
		  delay = 15
		  delay = 0
          await userEvent.type('foo', { delay, skipHover });
        }
      `,
			options: [{ eventModules: ['user-event'] }],
			errors: [
				{
					line: 7,
					column: 17,
					messageId: 'noAwaitSyncEvents',
					data: { name: 'userEvent.type' },
				},
			],
		},
	],
});
