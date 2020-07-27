import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-side-effects-wait-for';

const ruleTester = createRuleTester({
  ecmaFeatures: {
    jsx: true,
  },
});

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
      `
    }, {
      code: `
        import { waitFor } from '@testing-library/react';  
        fireEvent.keyDown(input, {key: 'ArrowDown'})
        await waitFor(function() {
          expect(b).toEqual('b')
        })
      `
    }, {
      code: `
        import { waitFor } from 'react';  
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `
    }
  ],
  invalid: [
    // fireEvent
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          expect(b).toEqual('b')
          fireEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          fireEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    // userEvent
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          expect(b).toEqual('b')
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(() => {
          userEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          expect(b).toEqual('b')
          userEvent.keyDown(input, {key: 'ArrowDown'})
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    },
    {
      code: `
        import { waitFor } from '@testing-library/react';  
        await waitFor(function() {
          userEvent.keyDown(input, {key: 'ArrowDown'})
          expect(b).toEqual('b')
        })
      `,
      errors: [{ messageId: 'noSideEffectsWaitFor' }]
    }
  ]
})
