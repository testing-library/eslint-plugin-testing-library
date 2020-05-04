import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/no-dom-import';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    { code: 'import { foo } from "foo"' },
    { code: 'import "foo"' },
    { code: 'import { fireEvent } from "react-testing-library"' },
    { code: 'import * as testing from "react-testing-library"' },
    { code: 'import { fireEvent } from "@testing-library/react"' },
    { code: 'import * as testing from "@testing-library/react"' },
    { code: 'import "react-testing-library"' },
    { code: 'import "@testing-library/react"' },
    { code: 'const { foo } = require("foo")' },
    { code: 'require("foo")' },
    { code: 'require("")' },
    { code: 'require()' },
    { code: 'const { fireEvent } = require("react-testing-library")' },
    { code: 'const { fireEvent } = require("@testing-library/react")' },
    { code: 'require("react-testing-library")' },
    { code: 'require("@testing-library/react")' },
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
