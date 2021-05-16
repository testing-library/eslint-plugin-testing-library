import rule, { RULE_NAME } from '../../../lib/rules/no-promise-in-fire-event';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import {fireEvent} from '@testing-library/foo';
        
        fireEvent.click(screen.getByRole('button'))
      `,
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(queryByRole('button'))`,
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(someRef)`,
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';
        
        fireEvent.click(await screen.findByRole('button'))
      `,
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo'

        const elementPromise = screen.findByRole('button')
        const button = await elementPromise
        fireEvent.click(button)`,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `// invalid usage but aggressive reporting opted-out
        import { fireEvent } from 'somewhere-else'
        fireEvent.click(findByText('submit'))
    `,
    },
    `// edge case for coverage:
     // valid use case without call expression
     // so there is no innermost function scope found
     test('edge case for no innermost function scope', () => {
      const click = fireEvent.click
    })
    `,
    `// edge case for coverage:
     // new expression of something else than Promise
     fireEvent.click(new SomeElement())
    `,
  ],
  invalid: [
    {
      // aggressive reporting opted-in
      code: `fireEvent.click(findByText('submit'))`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 1,
          column: 17,
          endColumn: 37,
        },
      ],
    },
    {
      // aggressive reporting opted-in
      code: `fireEvent.click(Promise())`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 1,
          column: 17,
          endColumn: 26,
        },
      ],
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        const promise = new Promise();
        fireEvent.click(promise)`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 5,
          column: 25,
          endColumn: 32,
        },
      ],
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo'

        const elementPromise = screen.findByRole('button')
        fireEvent.click(elementPromise)`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 5,
          column: 25,
          endColumn: 39,
        },
      ],
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(screen.findByRole('button'))`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 4,
          column: 25,
          endColumn: 52,
        },
      ],
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(findByText('submit'))`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 4,
          column: 25,
          endColumn: 45,
        },
      ],
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(Promise('foo'))`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 4,
          column: 25,
          endColumn: 39,
        },
      ],
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(new Promise('foo'))`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
          line: 4,
          column: 25,
          endColumn: 43,
        },
      ],
    },
  ],
});
