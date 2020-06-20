import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-promise-in-fire-event';

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
      code: `fireEvent.click(findByText('submit'))`,
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(promise)`,
    },
    {
      code: `
        import {fireEvent} from '@testing-library/foo';
        
        fireEvent.click(await screen.findByRole('button'))
      `,
    },
    {
      code: `fireEvent.click(Promise())`,
    },
  ],
  invalid: [
    {
      code: `
        import {fireEvent} from '@testing-library/foo';

        fireEvent.click(screen.findByRole('button'))`,
      errors: [
        {
          messageId: 'noPromiseInFireEvent',
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
        },
      ],
    },
  ],
});
