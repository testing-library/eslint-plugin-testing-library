'use strict';

const rule = require('../../../lib/rules/no-dom-import');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
});

ruleTester.run('no-dom-import', rule, {
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
    },
    {
      code: 'import { fireEvent } from "dom-testing-library"',
      options: ['react'],
      errors: [
        {
          message:
            'import from DOM Testing Library is restricted, import from react-testing-library instead',
        },
      ],
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
          message:
            'import from DOM Testing Library is restricted, import from @testing-library/vue instead',
        },
      ],
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
