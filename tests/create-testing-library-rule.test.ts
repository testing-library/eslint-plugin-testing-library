import { createRuleTester } from './lib/test-utils';
import rule, { RULE_NAME } from './fake-rule';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      // should NOT report `render` imported for non-related Testing Library module
      code: `
      import { render } from '@somewhere/else'
      
      const utils = render();
      `,
    },
  ],
  invalid: [
    {
      // should report `render` imported from Testing Library module
      code: `
      import { render } from '@testing-library/react'
      
      const utils = render();
      `,
      errors: [
        {
          line: 4,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
  ],
});
