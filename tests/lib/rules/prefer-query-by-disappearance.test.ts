import rule, {
  RULE_NAME,
} from '../../../lib/rules/prefer-query-by-disappearance';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

// TODO: add test cases without screen.
ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(() => screen.queryByText("hello"))
      `,
    },
    // {
    //   code: `
    //     import { screen } from '@testing-library/react';

    //     await waitForElementToBeRemoved(() => {
    //       screen.queryByText("hello")
    //     })
    //   `,
    // },
    // {
    //   code: `
    //     import { screen } from '@testing-library/react';

    //     await waitForElementToBeRemoved(() => {
    //       return screen.queryByText("hello")
    //     })
    //   `,
    // },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          screen.queryByText("hello")
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          return screen.queryByText('hey')
        })
      `,
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(screen.queryByText("hello"))
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        waitForElementToBeRemoved(() => screen.getByText("hello"))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 35,
        },
      ],
    },
    {
      code: `
        import { screen, waitForElementToBeRemoved } from '@testing-library/react';

        await waitForElementToBeRemoved(screen.getByText("hello"))
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          return screen.getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
    {
      code: `
        import { screen } from '@testing-library/react';

        await waitForElementToBeRemoved(function() {
          screen.getByText('hey')
        })
      `,
      errors: [
        {
          messageId: 'preferQueryByDisappearance',
          line: 4,
          column: 41,
        },
      ],
    },
  ],
});
