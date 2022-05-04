import rule, { RULE_NAME } from '../../../lib/rules/no-dom-import';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    'import { foo } from "foo"',
    'import "foo"',
    'import { fireEvent } from "react-testing-library"',
    'import * as testing from "react-testing-library"',
    'import { fireEvent } from "@testing-library/react"',
    'import * as testing from "@testing-library/react"',
    'import "react-testing-library"',
    'import "@testing-library/react"',
    'const { foo } = require("foo")',
    'require("foo")',
    'require("")',
    'require()',
    'const { fireEvent } = require("react-testing-library")',
    'const { fireEvent } = require("@testing-library/react")',
    'require("react-testing-library")',
    'require("@testing-library/react")',
    'require("@marko/testing-library")',
    {
      code: 'import { fireEvent } from "test-utils"',
      settings: { 'testing-library/utils-module': 'test-utils' },
    },
  ],
  invalid: [
    {
      code: 'import { fireEvent } from "dom-testing-library"',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
      output: 'import { fireEvent } from "dom-testing-library"',
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: dom-testing-library imported with custom module setting
      import { fireEvent } from "dom-testing-library"`,
      errors: [
        {
          line: 3,
          messageId: 'noDomImport',
        },
      ],
      output: `
      // case: dom-testing-library imported with custom module setting
      import { fireEvent } from "dom-testing-library"`,
    },
    {
      code: 'import { fireEvent } from "dom-testing-library"',
      options: ['react'],
      errors: [
        {
          messageId: 'noDomImportFramework',
          data: {
            module: 'react-testing-library',
          },
        },
      ],
      output: `import { fireEvent } from "react-testing-library"`,
    },
    {
      code: 'import { fireEvent } from "dom-testing-library"',
      options: ['marko'],
      errors: [
        {
          messageId: 'noDomImportFramework',
          data: {
            module: '@marko/testing-library',
          },
        },
      ],
      output: `import { fireEvent } from "@marko/testing-library"`,
    },
    // Single quote or double quotes should not be replaced
    {
      code: `import { fireEvent } from 'dom-testing-library'`,
      options: ['react'],
      errors: [
        {
          messageId: 'noDomImportFramework',
          data: {
            module: 'react-testing-library',
          },
        },
      ],
      output: `import { fireEvent } from 'react-testing-library'`,
    },
    {
      code: 'import * as testing from "dom-testing-library"',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: dom-testing-library wildcard imported with custom module setting
      import * as testing from "dom-testing-library"`,
      errors: [
        {
          line: 3,
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'import { fireEvent } from "@testing-library/dom"',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: @testing-library/dom imported with custom module setting
      import { fireEvent } from "@testing-library/dom"`,
      errors: [
        {
          line: 3,
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'import * as testing from "@testing-library/dom"',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'import "dom-testing-library"',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'import "@testing-library/dom"',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'const { fireEvent } = require("dom-testing-library")',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: dom-testing-library required with custom module setting
      const { fireEvent } = require("dom-testing-library")`,
      errors: [
        {
          line: 3,
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'const { fireEvent } = require("@testing-library/dom")',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'const { fireEvent } = require("@testing-library/dom")',
      options: ['vue'],
      errors: [
        {
          messageId: 'noDomImportFramework',
          data: {
            module: '@testing-library/vue',
          },
        },
      ],
      output: 'const { fireEvent } = require("@testing-library/vue")',
    },
    {
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
      code: `
      // case: @testing-library/dom required with custom module setting
      const { fireEvent } = require("@testing-library/dom")`,
      options: ['vue'],
      errors: [
        {
          messageId: 'noDomImportFramework',
          data: {
            module: '@testing-library/vue',
          },
        },
      ],
      output: `
      // case: @testing-library/dom required with custom module setting
      const { fireEvent } = require("@testing-library/vue")`,
    },
    {
      code: 'require("dom-testing-library")',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'require("@testing-library/dom")',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
  ],
});
