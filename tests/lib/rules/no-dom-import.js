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
    { code: 'import { waitForElement } from "react-testing-library"' },
    { code: 'import * as testing from "react-testing-library"' },
    { code: 'import { waitForElement } from "@testing-library/react"' },
    { code: 'import * as testing from "@testing-library/react"' },
    { code: 'import "react-testing-library"' },
    { code: 'import "@testing-library/react"' },
    { code: 'const { foo } = require("foo")' },
    { code: 'require("foo")' },
    { code: 'require("")' },
    { code: 'require()' },
    { code: 'const { waitForElement } = require("react-testing-library")' },
    { code: 'const { waitForElement } = require("@testing-library/react")' },
    { code: 'require("react-testing-library")' },
    { code: 'require("@testing-library/react")' },
  ],
  invalid: [
    {
      code: 'import { waitForElement } from "dom-testing-library"',
      errors: [
        {
          messageId: 'noDomImport',
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
      code: 'import { waitForElement } from "@testing-library/dom"',
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
      code: 'const { waitForElement } = require("dom-testing-library")',
      errors: [
        {
          messageId: 'noDomImport',
        },
      ],
    },
    {
      code: 'const { waitForElement } = require("@testing-library/dom")',
      errors: [
        {
          messageId: 'noDomImport',
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
