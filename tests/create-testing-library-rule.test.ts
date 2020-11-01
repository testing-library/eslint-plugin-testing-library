import { createRuleTester } from './lib/test-utils';
import rule, { RULE_NAME } from './fake-rule';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Test Cases for Imports & Filename
    {
      code: `
      // case: nothing related to Testing Library at all
      import { shallow } from 'enzyme';
      
      const wrapper = shallow(<MyComponent />);
      `,
    },
    {
      code: `
      // case: nothing related to Testing Library at all (require version)
      const { shallow } = require('enzyme');
      
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
      // case: render imported from other than custom module (require version)
      const { render } = require('@somewhere/else')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: prevent import which should trigger an error since it's imported
      // from other than settings custom module
      import { foo } from 'report-me'
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: prevent import which should trigger an error since it's imported
      // from other than settings custom module (require version)
      const { foo } = require('report-me')
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
    },
    {
      code: `
      // case: import module forced to be reported but not matching settings filename
      import { foo } from 'report-me'
    `,
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
    },
    {
      code: `
      // case: import module forced to be reported but not matching settings filename
      // (require version)
      const { foo } = require('report-me')
    `,
      settings: {
        'testing-library/filename-pattern': 'testing-library\\.js',
      },
    },
    {
      code: `
      // case: import custom module forced to be reported without custom module setting
      import { foo } from 'custom-module-forced-report'
    `,
    },
  ],
  invalid: [
    // Test Cases for Imports & Filename
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
        'testing-library/filename-pattern': 'testing-library\\.js',
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
      const foo = require('bar')
      
      const utils = render();
      `,
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module (require version)
      const { render } = require('@testing-library/react')
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from settings custom module
      import { render } from 'test-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
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
    {
      code: `
      // case: render imported from settings custom module (require version)
      const { render } = require('test-utils')
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
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
    {
      code: `
      // case: render imported from Testing Library module with
      // settings custom module
      import { render } from '@testing-library/react'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 8,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      code: `
      // case: render imported from Testing Library module with
      // settings custom module (require version)
      const { render } = require('@testing-library/react')
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      settings: {
        'testing-library/module': 'test-utils',
      },
      errors: [
        {
          line: 8,
          column: 21,
          messageId: 'fakeError',
        },
      ],
    },
    {
      settings: {
        'testing-library/module': 'custom-module-forced-report',
      },
      code: `
      // case: import custom module forced to be reported with custom module setting
      import { foo } from 'custom-module-forced-report'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
  ],
});
