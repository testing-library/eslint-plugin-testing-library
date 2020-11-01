import { createRuleTester } from './lib/test-utils';
import rule, { RULE_NAME } from './fake-rule';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `
      // case: nothing related to Testing Library at all
      import { shallow } from 'enzyme';
      
      const wrapper = shallow(<MyComponent />);
      `,
    },
    {
      code: `
      // case: render imported from other than custom module
      import { render } from '@somewhere/else'
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: prevent import which should trigger an error since it's imported
      // from other than custom module
      import { foo } from 'report-me'
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: import module forced to be reported but not matching file name
      import { foo } from 'report-me'
    `,
      settings: {
        'testing-library/file-name': 'testing-library\\.js',
      },
    },
  ],
  invalid: [
    {
      code: `
      // case: import module forced to be reported
      import { foo } from 'report-me'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
    {
      filename: 'MyComponent.spec.js',
      code: `
      // case: import module forced to be reported but from .spec.js named file
      import { foo } from 'report-me'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
    {
      filename: 'MyComponent.testing-library.js',
      code: `
      // case: import module forced to be reported with custom file name
      import { foo } from 'report-me'
    `,
      settings: {
        'testing-library/file-name': 'testing-library\\.js',
      },
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
    {
      code: `
      // case: render imported from any module by default (aggressive reporting)
      import { render } from '@somewhere/else'
      import { somethingElse } from 'another-module'
      
      const utils = render();
      `,
      errors: [
        {
          line: 6,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module
      import { render } from '@testing-library/react'
      import { somethingElse } from 'another-module'
      
      const utils = render();
      `,
      errors: [
        {
          line: 6,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from config custom module
      import { render } from 'test-utils'
      import { somethingElse } from 'another-module'
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 6,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module if
      // custom module setup
      import { render } from '@testing-library/react'
      import { somethingElse } from 'another-module'
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
  ],
});
