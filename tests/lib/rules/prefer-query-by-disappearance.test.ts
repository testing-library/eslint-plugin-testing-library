import rule, {
  RULE_NAME,
} from '../../../lib/rules/prefer-query-by-disappearance';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(() => screen.queryByText("hello"))
      `,
    },
  ],
  invalid: [
    // {
    //   code: `
    //     import { screen, waitForElementToBeRemoved } from '@testing-library/react';

    //     waitForElementToBeRemoved(() => screen.getByText("hello"))
    //   `,
    //   errors: [
    //     {
    //       messageId: 'preferQueryByDisappearance',
    //       line: 4,
    //       column: 17,
    //     },
    //   ],
    // },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(screen.getByText("hello"))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 48,
        },
      ],
    },
  ],
});
