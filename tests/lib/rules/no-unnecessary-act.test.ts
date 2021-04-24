import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-unnecessary-act';

const ruleTester = createRuleTester();

/**
 * - AGR stands for Aggressive Reporting
 * - RTL stands for react-testing-library (@testing-library/react)
 * - RTU stands for react-test-utils (react-dom/test-utils)
 */
ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `// case: RTL act wrapping non-RTL calls
      import { act } from '@testing-library/react'

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
        
        /* TODO get this one back
        act(function() {
          return stuffThatDoesNotUseRTL();
        });
        */
        
        act(() => stuffThatDoesNotUseRTL());
      });
      `,
    },
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
        
        /* TODO get this one back
        act(function() {
          return stuffThatDoesNotUseRTL();
        });
        */
        
        act(() => stuffThatDoesNotUseRTL());
      });
      `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `// case: RTL act wrapping non-RTL - AGR disabled
      import { act } from '@testing-library/react'
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
        
        /* TODO get this one back
        act(function() {
          return waitFor();
        });
        */
        
        act(() => waitFor());
      });
      `,
    },
    {
      code: `// case: RTL act wrapping both RTL and non-RTL calls
      import { act, render, waitFor } from '@testing-library/react'

      test('valid case', async () => {
        act(() => {
          render(<Foo />);
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
  ],
  invalid: [
    {
      code: `// case: RTL act wrapping RTL calls - callbacks with body (BlockStatement)
      import { act, fireEvent, screen, render, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
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

    // TODO case: RTL act wrapping RTL calls - callbacks with return
    // TODO case: RTU act wrapping RTL calls - callbacks with body (BlockStatement)
    // TODO case: RTU act wrapping RTL calls - callbacks with return
    // TODO case: RTL act wrapping empty callback
    // TODO case: RTU act wrapping empty callback

    // TODO cases like previous ones but with AGR disabled
  ],
});
