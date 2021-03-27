import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-await-sync-events';
import { EVENTS_SIMULATORS } from '../../../lib/utils';

const ruleTester = createRuleTester();

const fireEventFunctions = [
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
const userEventFunctions = [
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

let syncEventFunctions: string[] = [];
for (const simulatorObj of EVENTS_SIMULATORS) {
  switch (simulatorObj) {
    case 'fireEvent':
      syncEventFunctions = syncEventFunctions.concat(
        fireEventFunctions.map((f: string): string => `${simulatorObj}.${f}`)
      );
      break;
    case 'userEvent':
      syncEventFunctions = syncEventFunctions.concat(
        userEventFunctions.map((f: string): string => `${simulatorObj}.${f}`)
      );
      break;
    default:
      syncEventFunctions.push(`${simulatorObj}.anyFunc`);
  }
}

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // sync events without await are valid
    // userEvent.type() and userEvent.keyboard() are exceptions
    ...syncEventFunctions.map((func) => ({
      code: `() => {
        ${func}('foo')
      }
      `,
    })),
    {
      code: `() => {
        userEvent.type('foo')
      }
      `,
    },
    {
      code: `() => {
        await userEvent.type('foo', 'bar', {delay: 1234})
      }
      `,
    },
    {
      code: `() => {
        await userEvent.keyboard('foo', {delay: 1234})
      }
      `,
    },
  ],

  invalid: [
    // sync events with await operator are not valid
    ...syncEventFunctions.map((func) => ({
      code: `
        import { fireEvent } from '@testing-library/framework';
        import userEvent from '@testing-library/user-event';
        test('should report sync event awaited', async() => {
          await ${func}('foo');
        });
      `,
      errors: [{ line: 5, messageId: 'noAwaitSyncEvents' }],
    })),
    {
      code: `
        import userEvent from '@testing-library/user-event';
        test('should report async events without delay awaited', async() => {
          await userEvent.type('foo', 'bar');
          await userEvent.keyboard('foo');
        });
      `,
      errors: [
        { line: 4, messageId: 'noAwaitSyncEvents' },
        { line: 5, messageId: 'noAwaitSyncEvents' },
      ],
    },
    // TODO: make sure this case is covered
    /* eslint-disable jest/no-commented-out-tests */
    // {
    //   code: `
    //     import userEvent from '@testing-library/user-event';
    //     test('should report async events with 0 delay awaited', async() => {
    //       await userEvent.type('foo', 'bar', { delay: 0 });
    //       await userEvent.keyboard('foo', { delay: 0 });
    //     });
    //   `,
    //   errors: [
    //     { line: 4, messageId: 'noAwaitSyncEvents' },
    //     { line: 5, messageId: 'noAwaitSyncEvents' },
    //   ],
    // },
  ],
});
