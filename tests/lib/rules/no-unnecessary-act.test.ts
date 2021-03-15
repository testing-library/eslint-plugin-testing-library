import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-unnecessary-act';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true
  }
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { act } from '@testing-library/react';
        act(() => {
          stuffThatDoesNotUseRTL();
        });
      `
    },
    {
      code: `
        const { act } = require('@testing-library/react');
        act(() => {
          stuffThatDoesNotUseRTL();
        });
      `
    },
    {
      code: `
        import ReactTestUtils from 'react-dom/test-utils'
        ReactTestUtils.act(() => {
          stuffThatDoesNotUseRTL();
        });
      `
    },
    {
      code: `
        import { act, fireEvent } from '@testing-library/react';
        act(() => {
          fireEvent.click(el);
          stuffThatDoesNotUseRTL();
        });
      `
    },
    {
      code: `
        import * as rtl from '@testing-library/react';
        rtl.act(() => {
          rtl.fireEvent.click(el);
          stuffThatDoesNotUseRTL();
        });
      `
    }
  ],
  invalid: [
    {
      code: `
        import { act } from '@testing-library/react';

        await act(async () => {});
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { act } from '@testing-library/react';
        import userEvent from '@testing-library/user-event';

        await act(async () => userEvent.type('hi', el));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { screen, act } from '@testing-library/react';

        act(() => screen.getByText('blah'));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { act } from '@testing-library/react';

        act(() => {});
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { fireEvent, act } from '@testing-library/react';

        act(() => fireEvent.click(el));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { fireEvent, act } from '@testing-library/react';

        act(() => {
          fireEvent.click(el)
        });
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { act } from '@testing-library/react';
        import userEvent from '@testing-library/user-event';

        act(() => userEvent.click(el));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import * as rtl from '@testing-library/react';
        import userEvent from '@testing-library/user-event';

        rtl.act(() => userEvent.click(el));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { act, render } from '@testing-library/react';

        act(() => render(<div />));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import { act, render } from '@testing-library/react';

        await act(async () => render(<div />));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    },
    {
      code: `
        import * as rtl from '@testing-library/react';

        rtl.act(() => rtl.screen.getByText('blah'));
      `,
      errors: [
        {
          messageId: 'noUnnecessaryAct'
        }
      ]
    }
  ]
});
