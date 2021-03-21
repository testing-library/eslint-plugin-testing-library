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
        'testing-library/utils-module': 'test-utils',
      },
    },
    {
      code: `
      // case: render imported from other than custom module (require version)
      const { render } = require('@somewhere/else')
      
      const utils = render();
      `,
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
    },
    {
      code: `
      // case: prevent import which should trigger an error since it's imported
      // from other than settings custom module
      import { foo } from 'report-me'
      `,
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
    },
    {
      code: `
      // case: prevent import which should trigger an error since it's imported
      // from other than settings custom module (require version)
      const { foo } = require('report-me')
      `,
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
    },
    {
      code: `
      // case: import module forced to be reported but not matching settings filename
      import { foo } from 'report-me'
    `,
      settings: {
        'testing-library/file-patterns': ['**/?(*.)+(not-matching).[jt]s?(x)'],
      },
    },
    {
      code: `
      // case: import module forced to be reported but not matching settings filename
      // (require version)
      const { foo } = require('report-me')
    `,
      settings: {
        'testing-library/file-patterns': ['**/?(*.)+(not-matching).[jt]s?(x)'],
      },
    },
    {
      code: `
      // case: import custom module forced to be reported without custom module setting
      import { foo } from 'custom-module-forced-report'
    `,
    },

    // Test Cases for renders
    {
      code: `
      // case: aggressive render enabled - method not containing "render"
      import { somethingElse } from '@somewhere/else'
      
      const utils = somethingElse()
      `,
    },
    {
      settings: { 'testing-library/custom-renders': ['renderWithRedux'] },
      code: `
      // case: aggressive render disabled - method not matching valid render
      import { customRender } from '@somewhere/else'
      
      const utils = customRender()
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      // case: aggressive render enabled, but module disabled - not coming from TL
      import { render } from 'somewhere-else'
      
      const utils = render()
      `,
    },
    {
      filename: 'file.not.matching.js',
      code: `
      // case: aggressive render and module enabled, but file name not matching
      import { render } from '@testing-library/react'
      
      const utils = render()
      `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case (render util): aggressive reporting disabled - method with same name
      // as TL method but not coming from TL module is valid
      import { render as testingLibraryRender } from 'test-utils'
      import { render } from 'somewhere-else'

      const utils = render()
      `,
    },

    // Test Cases for presence/absence assertions
    // cases: asserts not related to presence/absence
    'expect(element).toBeDisabled()',
    'expect(element).toBeEnabled()',

    // cases: presence/absence matcher not related to assert
    'element.toBeInTheDocument()',
    'element.not.toBeInTheDocument()',

    // cases: weird scenarios to check guard against parent nodes
    'expect(element).not()',
    'expect(element).not()',

    // Test Cases for Queries and Aggressive Queries Reporting
    {
      code: `
      // case: custom method not matching "getBy*" variant pattern
      getSomeElement('button')
    `,
    },
    {
      code: `
      // case: custom method not matching "getBy*" variant pattern using within
      within(container).getSomeElement('button')
    `,
    },
    {
      code: `
      // case: custom method not matching "queryBy*" variant pattern
      querySomeElement('button')
    `,
    },
    {
      code: `
      // case: custom method not matching "queryBy*" variant pattern using within
      within(container).querySomeElement('button')
    `,
    },
    {
      code: `
      // case: custom method not matching "findBy*" variant pattern
      findSomeElement('button')
    `,
    },
    {
      code: `
      // case: custom method not matching "findBy*" variant pattern using within
      within(container).findSomeElement('button')
    `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "getBy*" query not reported because custom module not imported
      import { render } from 'other-module'
      getByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "getBy*" query not reported because custom module not imported  using within
      import { render } from 'other-module'
      within(container).getByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query not reported because custom module not imported
      import { render } from 'other-module'
      queryByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query not reported because custom module not imported using within
      import { render } from 'other-module'
      within(container).queryByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "findBy*" query not reported because custom module not imported
      import { render } from 'other-module'
      findByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "findBy*" query not reported because custom module not imported using within
      import { render } from 'other-module'
      within(container).findByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/file-patterns': ['**/?(*.)+(not-matching).[jt]s?(x)'],
      },
      code: `
      // case: built-in "getBy*" query not reported because custom filename doesn't match
      getByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/file-patterns': ['**/?(*.)+(not-matching).[jt]s?(x)'],
      },
      code: `
      // case: built-in "queryBy*" query not reported because custom filename doesn't match
      queryByRole('button')
    `,
    },
    {
      settings: {
        'testing-library/file-patterns': ['**/?(*.)+(not-matching).[jt]s?(x)'],
      },
      code: `
      // case: built-in "findBy*" query not reported because custom filename doesn't match
      findByRole('button')
    `,
    },

    // Test Cases for async utils
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import { waitFor } from 'some-other-library';
        test(
          'aggressive reporting disabled - util waitFor not related to testing library is valid',
          () => { waitFor() }
        );
      `,
    },
    {
      filename: 'file.not.matching.js',
      code: `
      // case: waitFor util found, but file name not matching
      import { waitFor } from '@testing-library/react'
      
      waitFor()
      `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case (async util): aggressive reporting disabled - method with same name
      // as TL method but not coming from TL module is valid
      import { waitFor as testingLibraryWaitFor } from 'test-utils'
      import { waitFor } from 'somewhere-else'

        test('this should not be reported', () => {
        waitFor()
      });
      `,
    },

    // Test Cases for all settings mixed
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
        'testing-library/file-patterns': ['**/?(*.)+(not-matching).[jt]s?(x)'],
      },
      code: `
      // case: matching custom settings partially - module but not filename
      import { render } from 'test-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
        'testing-library/file-patterns': ['**/?(*.)+(not-matching).[jt]s?(x)'],
      },
      filename: 'project/src/MyComponent.testing-library.js',
      code: `
      // case: matching custom settings partially - filename but not module
      import { render } from 'other-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      // case: aggressive module disabled and render coming from non-related module
      import * as somethingElse from '@somewhere/else'
      import { render } from '@testing-library/react'
      
      // somethingElse.render is not coming from any module related to TL
      const utils = somethingElse.render()
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
      filename: 'project/src/MyComponent.spec.js',
      code: `
      // case: import module forced to be reported but from .spec.js named file
      import { foo } from 'report-me'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },
    {
      filename: 'project/src/MyComponent.testing-library.js',
      code: `
      // case: import module forced to be reported with custom file name
      import { foo } from 'report-me'
    `,
      settings: {
        'testing-library/file-patterns': [
          '**/?(*.)+(testing-library).[jt]s?(x)',
        ],
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
          messageId: 'renderError',
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
          messageId: 'renderError',
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
          messageId: 'renderError',
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
        'testing-library/utils-module': 'test-utils',
      },
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'renderError',
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
        'testing-library/utils-module': 'test-utils',
      },
      errors: [
        {
          line: 7,
          column: 21,
          messageId: 'renderError',
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
        'testing-library/utils-module': 'test-utils',
      },
      errors: [
        {
          line: 8,
          column: 21,
          messageId: 'renderError',
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
        'testing-library/utils-module': 'test-utils',
      },
      errors: [
        {
          line: 8,
          column: 21,
          messageId: 'renderError',
        },
      ],
    },
    {
      settings: {
        'testing-library/utils-module': 'custom-module-forced-report',
      },
      code: `
      // case: import custom module forced to be reported with custom module setting
      import { foo } from 'custom-module-forced-report'
    `,
      errors: [{ line: 3, column: 7, messageId: 'fakeError' }],
    },

    // Test Cases for renders
    {
      code: `
      // case: aggressive render enabled - Testing Library render
      import { render } from '@testing-library/react'
      
      const utils = render()
      `,
      errors: [{ line: 5, column: 21, messageId: 'renderError' }],
    },
    {
      code: `
      // case: aggressive render enabled - Testing Library render wildcard imported
      import * as rtl from '@testing-library/react'
      
      const utils = rtl.render()
      `,
      errors: [{ line: 5, column: 25, messageId: 'renderError' }],
    },
    {
      code: `
      // case: aggressive render enabled - any method containing "render"
      import { someRender } from '@somewhere/else'
      
      const utils = someRender()
      `,
      errors: [{ line: 5, column: 21, messageId: 'renderError' }],
    },
    {
      settings: { 'testing-library/custom-renders': ['customRender'] },
      code: `
      // case: aggressive render disabled - Testing Library render
      import { render } from '@testing-library/react'
      
      const utils = render()
      `,
      errors: [{ line: 5, column: 21, messageId: 'renderError' }],
    },
    {
      settings: {
        'testing-library/custom-renders': ['customRender', 'renderWithRedux'],
      },
      code: `
      // case: aggressive render disabled - valid custom render
      import { customRender } from 'test-utils'
      
      const utils = customRender()
      `,
      errors: [{ line: 5, column: 21, messageId: 'renderError' }],
    },
    {
      settings: {
        'testing-library/custom-renders': ['customRender', 'renderWithRedux'],
      },
      code: `
      // case: aggressive render disabled - default render from custom module
      import { render } from 'test-utils'
      
      const utils = render()
      `,
      errors: [{ line: 5, column: 21, messageId: 'renderError' }],
    },
    {
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
      // case: aggressive module disabled and render wildcard-imported from related module
      import * as rtl from '@testing-library/react'
      
      const utils = rtl.render()
      `,
      errors: [{ line: 5, column: 25, messageId: 'renderError' }],
    },

    // Test Cases for presence/absence assertions
    {
      code: `
      // case: presence matcher .toBeInTheDocument forced to be reported
      expect(element).toBeInTheDocument()
      `,
      errors: [{ line: 3, column: 7, messageId: 'presenceAssertError' }],
    },
    {
      code: `
      // case: absence matcher .not.toBeInTheDocument forced to be reported
      expect(element).not.toBeInTheDocument()
      `,
      errors: [{ line: 3, column: 7, messageId: 'absenceAssertError' }],
    },
    {
      code: `
      // case: presence matcher .not.toBeNull forced to be reported
      expect(element).not.toBeNull()
      `,
      errors: [{ line: 3, column: 7, messageId: 'presenceAssertError' }],
    },
    {
      code: `
      // case: absence matcher .toBeNull forced to be reported
      expect(element).toBeNull()
      `,
      errors: [{ line: 3, column: 7, messageId: 'absenceAssertError' }],
    },

    // Test Cases for async utils
    {
      code: `
        import { waitFor } from 'test-utils';
        test(
          'aggressive reporting enabled - util waitFor reported no matter where is coming from',
          () => { waitFor() }
        );
      `,
      errors: [
        {
          line: 5,
          column: 19,
          messageId: 'asyncUtilError',
          data: { utilName: 'waitFor' },
        },
      ],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        import { waitFor } from 'test-utils';
        test(
          'aggressive reporting disabled - util waitFor related to testing library',
          () => { waitFor() }
        );
      `,
      errors: [
        {
          line: 5,
          column: 19,
          messageId: 'asyncUtilError',
          data: { utilName: 'waitFor' },
        },
      ],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
        // case: aggressive reporting disabled - waitFor from wildcard import related to TL 
        import * as tl from 'test-utils'
        tl.waitFor(() => {})
      `,
      errors: [
        {
          line: 4,
          column: 12,
          messageId: 'asyncUtilError',
          data: { utilName: 'waitFor' },
        },
      ],
    },

    // Test Cases for Queries and Aggressive Queries Reporting
    {
      code: `
      // case: built-in "getBy*" query reported without import (aggressive reporting)
      getByRole('button')
    `,
      errors: [{ line: 3, column: 7, messageId: 'getByError' }],
    },
    {
      code: `
      // case: built-in "getBy*" query reported without import using within (aggressive reporting)
      within(container).getByRole('button')
    `,
      errors: [{ line: 3, column: 25, messageId: 'getByError' }],
    },
    {
      code: `
      // case: built-in "queryBy*" query reported without import (aggressive reporting)
      queryByRole('button')
    `,
      errors: [{ line: 3, column: 7, messageId: 'queryByError' }],
    },
    {
      code: `
      // case: built-in "queryBy*" query reported without import using within (aggressive reporting)
      within(container).queryByRole('button')
    `,
      errors: [{ line: 3, column: 25, messageId: 'queryByError' }],
    },
    {
      code: `
      // case: built-in "findBy*" query reported without import (aggressive reporting)
      findByRole('button')
    `,
      errors: [{ line: 3, column: 7, messageId: 'findByError' }],
    },
    {
      code: `
      // case: built-in "findBy*" query reported without import using within (aggressive reporting)
      within(container).findByRole('button')
    `,
      errors: [{ line: 3, column: 25, messageId: 'findByError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      code: `
      // case: custom "getBy*" query reported without import (aggressive reporting)
      getByIcon('search')
    `,
      errors: [{ line: 3, column: 7, messageId: 'customQueryError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      code: `
      // case: custom "getBy*" query reported without import using within (aggressive reporting)
      within(container).getByIcon('search')
    `,
      errors: [{ line: 3, column: 25, messageId: 'customQueryError' }],
    },
    {
      code: `
      // case: custom "queryBy*" query reported without import (aggressive reporting)
      queryByIcon('search')
    `,
      errors: [{ line: 3, column: 7, messageId: 'customQueryError' }],
    },
    {
      code: `
      // case: custom "queryBy*" query reported without import using within (aggressive reporting)
      within(container).queryByIcon('search')
    `,
      errors: [{ line: 3, column: 25, messageId: 'customQueryError' }],
    },
    {
      code: `
      // case: custom "findBy*" query reported without import (aggressive reporting)
      findByIcon('search')
    `,
      errors: [{ line: 3, column: 7, messageId: 'customQueryError' }],
    },
    {
      code: `
      // case: custom "findBy*" query reported without import using within (aggressive reporting)
      within(container).findByIcon('search')
    `,
      errors: [{ line: 3, column: 25, messageId: 'customQueryError' }],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "getBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      getByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'getByError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      queryByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'queryByError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "findBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      findByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'findByError' }],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "getBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      getByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'getByError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      queryByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'queryByError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: built-in "queryBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      findByRole('button')
    `,
      errors: [{ line: 4, column: 7, messageId: 'findByError' }],
    },

    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: custom "getBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/react'
      getByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'customQueryError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: custom "queryBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/framework'
      queryByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'customQueryError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: custom "findBy*" query reported with custom module + Testing Library package import
      import { render } from '@testing-library/framework'
      findByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'customQueryError' }],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: custom "getBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      getByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'customQueryError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: custom "queryBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      queryByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'customQueryError' }],
    },
    {
      filename: 'project/src/MyComponent.spec.js',
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: custom "findBy*" query reported with custom module + custom module import
      import { render } from 'test-utils'
      findByIcon('search')
    `,
      errors: [{ line: 4, column: 7, messageId: 'customQueryError' }],
    },

    // Test Cases for all settings mixed
    {
      filename: 'project/src/MyComponent.custom-suffix.js',
      settings: {
        'testing-library/custom-renders': ['customRender', 'renderWithRedux'],
        'testing-library/utils-module': 'test-utils',
        'testing-library/file-patterns': ['**/?(*.)+(custom-suffix).[jt]s?(x)'],
      },
      code: `
      // case: all aggressive reporting disabled and filename setup - matching all custom settings
      import { renderWithRedux, waitFor, screen } from 'test-utils'
      
      const { getByRole } = renderWithRedux()
      const el = getByRole('button')
      waitFor(() => {})
      `,
      errors: [
        { line: 5, column: 29, messageId: 'renderError' },
        { line: 6, column: 18, messageId: 'getByError' },
        {
          line: 7,
          column: 7,
          messageId: 'asyncUtilError',
          data: { utilName: 'waitFor' },
        },
      ],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
        'testing-library/file-patterns': [
          '**/?(*.)+(testing-library|custom-suffix).[jt]s?(x)',
        ],
      },
      filename: 'project/src/MyComponent.testing-library.js',
      code: `
      // case: matching all custom settings
      import { render } from 'test-utils'
      import { somethingElse } from 'another-module'
      const foo = require('bar')
      
      const utils = render();
      `,
      errors: [{ line: 7, column: 21, messageId: 'renderError' }],
    },
  ],
});
