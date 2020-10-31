import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-dom-import';

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
    {
      code: 'import { fireEvent } from "test-utils"',
      settings: { 'testing-library/module': 'test-utils' },
    },
    {
      code: 'import { fireEvent } from "dom-testing-library"',
      filename: 'filename.not-matching.js',
    },
    {
      code: 'import { fireEvent } from "dom-testing-library"',
      settings: { 'testing-library/filename': '^.*\\.(nope)\\.js$' },
    },
    {
      code: 'const { fireEvent } = require("dom-testing-library")',
      filename: 'filename.not-matching.js',
    },
    {
      code: 'const { fireEvent } = require("dom-testing-library")',
      settings: { 'testing-library/filename': '^.*\\.(nope)\\.js$' },
    },
    {
      code: 'import { fireEvent } from "@testing-library/dom"',
      filename: 'filename.not-matching.js',
    },
    {
      code: 'import { fireEvent } from "@testing-library/dom"',
      settings: { 'testing-library/filename': '^.*\\.(nope)\\.js$' },
    },
    {
      code: 'const { fireEvent } = require("@testing-library/dom")',
      filename: 'filename.not-matching.js',
    },
    {
      code: 'const { fireEvent } = require("@testing-library/dom")',
      settings: { 'testing-library/filename': '^.*\\.(nope)\\.js$' },
    },
  ],
  invalid: [
    // TODO: add invalid cases:
    //  - custom filename importing from dom-testing-library
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
      code: 'import { fireEvent } from "@testing-library/dom"',
      errors: [
        {
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
