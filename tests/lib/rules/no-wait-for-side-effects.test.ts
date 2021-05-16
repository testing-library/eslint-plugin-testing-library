import rule, { RULE_NAME } from '../../../lib/rules/no-wait-for-side-effects';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => expect(a).toEqual('a'))
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          expect(a).toEqual('a')
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          console.log('testing-library')
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {})
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {})
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          // testing
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          // testing
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        fireEvent.keyDown(input, {key: 'ArrowDown'})
        await waitFor(() => {
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        fireEvent.keyDown(input, {key: 'ArrowDown'})
        await waitFor(function() {
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        userEvent.click(button)
        await waitFor(function() {
          expect(b).toEqual('b')
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';  
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        
        anotherFunction(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'});
          userEvent.click(button);
        });
        
        test('side effects in functions other than waitFor are valid', () => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          userEvent.click(button)
          expect(b).toEqual('b')
        });
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor as renamedWaitFor, fireEvent } from 'test-utils';
        import { waitFor, userEvent } from 'somewhere-else';

        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          userEvent.click(button)
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor, fireEvent as renamedFireEvent, userEvent as renamedUserEvent } from 'test-utils';
        import { fireEvent, userEvent } from 'somewhere-else';

        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          userEvent.click(button)
        })
      `,
    },
    {
      code: `// weird case to cover 100% coverage
      await waitFor(() => {
        const click = firEvent['click']
      })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => fireEvent.keyDown(input, {key: 'ArrowDown'}))
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        import { userEvent } from '@testing-library/react';
        await waitFor(() => userEvent.click(button))
      `,
    },
    {
      settings: { 'testing-library/utils-module': '~/test-utils' },
      code: `
        import { waitFor, userEvent } from '~/test-utils';
        await waitFor(() => userEvent.click(button))
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => render(<App />))
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => {
          const { container } = render(<App />)
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        const { rerender } = render(<App />)
        await waitFor(() => {
          rerender(<App />)
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': '~/test-utils' },
      code: `
        import { waitFor } from '~/test-utils';
        import { render } from 'somewhere-else';
        await waitFor(() => render(<App />))
      `,
    },
    {
      settings: { 'testing-library/utils-module': '~/test-utils' },
      code: `
        import { waitFor } from '@testing-library/react';
        import { render } from 'somewhere-else';
        await waitFor(() => render(<App />))
      `,
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderWrapper } from 'somewhere-else';
        await waitFor(() => renderWrapper(<App />))
      `,
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderWrapper } from 'somewhere-else';
        await waitFor(() => {
          renderWrapper(<App />)
        })
      `,
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderWrapper } from 'somewhere-else';
        await waitFor(() => {
          const { container } = renderWrapper(<App />)
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => {
          render(<App />)
        })
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'test-utils';
        import { render } from 'somewhere-else';
        await waitFor(() => {
          render(<App />)
        })
      `,
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderWrapper } from 'somewhere-else';
        await waitFor(() => {
          renderWrapper(<App />)
        })
      `,
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => result = renderWrapper(<App />))
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'test-utils';
        import { render } from 'somewhere-else';
        await waitFor(() => result = render(<App />))
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { waitFor } from 'somewhere-else';
        await waitFor(() => result = render(<App />))
      `,
    },
  ],
  invalid: [
    // render
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => render(<App />))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(function() {
          render(<App />)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(function() {
          const { container } = renderHelper(<App />)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderHelper } from 'somewhere-else';
        await waitFor(() => renderHelper(<App />))
      `,
      errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderHelper } from 'somewhere-else';
        await waitFor(() => {
          renderHelper(<App />)
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderHelper } from 'somewhere-else';
        await waitFor(() => {
          const { container } = renderHelper(<App />)
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/custom-renders': ['renderHelper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderHelper } from 'somewhere-else';
        let container;
        await waitFor(() => {
          ({ container } = renderHelper(<App />))
        })
      `,
      errors: [{ line: 6, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => result = render(<App />))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => (a = 5, result = render(<App />)))
      `,
      errors: [{ line: 3, column: 30, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        const { rerender } = render(<App />)
        await waitFor(() => rerender(<App />))
      `,
      errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor, render } from '@testing-library/react';
        await waitFor(() => render(<App />))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        const { rerender } = render(<App />)
        await waitFor(() => rerender(<App />))
      `,
      errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => renderHelper(<App />))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        import { render } from 'somewhere-else';
        await waitFor(() => render(<App />))
      `,
      errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/utils-module': '~/test-utils' },
      code: `
        import { waitFor, render } from '~/test-utils';
        await waitFor(() => render(<App />))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/custom-renders': ['renderWrapper'] },
      code: `
        import { waitFor } from '@testing-library/react';
        import { renderWrapper } from 'somewhere-else';
        await waitFor(() => renderWrapper(<App />))
      `,
      errors: [{ line: 4, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          render(<App />)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          const { container } = render(<App />)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          result = render(<App />)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          const a = 5,
          { container } = render(<App />)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        const { rerender } = render(<App />)
        await waitFor(() => {
          rerender(<App />)
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          render(<App />)
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [
        { line: 4, column: 11, messageId: 'noSideEffectsWaitFor' },
        { line: 5, column: 11, messageId: 'noSideEffectsWaitFor' },
      ],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          render(<App />)
          userEvent.click(button)
        })
      `,
      errors: [
        { line: 4, column: 11, messageId: 'noSideEffectsWaitFor' },
        { line: 5, column: 11, messageId: 'noSideEffectsWaitFor' },
      ],
    },
    // fireEvent
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => fireEvent.keyDown(input, {key: 'ArrowDown'}))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/utils-module': '~/test-utils' },
      code: `
        import { waitFor, fireEvent } from '~/test-utils';
        await waitFor(() => fireEvent.keyDown(input, {key: 'ArrowDown'}))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor, fireEvent as renamedFireEvent } from '@testing-library/react';  
        await waitFor(() => {
          renamedFireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/utils-module': '~/test-utils' },
      code: `
        import { waitFor, fireEvent } from '~/test-utils';  
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    // userEvent
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => userEvent.click(button))
      `,
      errors: [{ line: 3, column: 29, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        await waitFor(() => {
          userEvent.click(button)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';
        import renamedUserEvent from '@testing-library/user-event'  
        await waitFor(() => {
          renamedUserEvent.click(button)
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      settings: { 'testing-library/utils-module': '~/test-utils' },
      code: `
        import { waitFor } from '~/test-utils';
        import userEvent from '@testing-library/user-event'  
        await waitFor(() => {
          userEvent.click();
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          expect(b).toEqual('b')
          userEvent.click(button)
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          userEvent.click(button)
          expect(b).toEqual('b')
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          userEvent.click(button)
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          expect(b).toEqual('b')
          userEvent.click(button)
        })
      `,
      errors: [{ line: 5, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          userEvent.click(button)
          expect(b).toEqual('b')
        })
      `,
      errors: [{ line: 4, column: 11, messageId: 'noSideEffectsWaitFor' }],
    },

    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `// all mixed
        import { waitFor, fireEvent as renamedFireEvent, screen } from '~/test-utils';
        import userEvent from '@testing-library/user-event'
        import { fireEvent } from 'somewhere-else'
          
        test('check all mixed', async () => {
          const button = await screen.findByRole('button')
          await waitFor(() => {
            renamedFireEvent.keyDown(input, {key: 'ArrowDown'})
            expect(b).toEqual('b')
            fireEvent.keyDown(input, {key: 'ArrowDown'})
            userEvent.click(button)
            someBool ? 'a' : 'b' // cover expression statement without identifier for 100% coverage
          })
        })
      `,
      errors: [
        { line: 9, column: 13, messageId: 'noSideEffectsWaitFor' },
        { line: 12, column: 13, messageId: 'noSideEffectsWaitFor' },
      ],
    },
  ],
});
