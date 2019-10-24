/**
 * @fileoverview prefer toBeDisabled or toBeEnabled over attribute checks
 * @author Ben Monro
 */
'use strict';
const rule = require('../../../lib/rules/jest-dom-prefer-enabled-disabled');

const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
});
ruleTester.run('jest-dom-prefer-enabled-disabled', rule, {
  valid: [
    `expect(element).toBeDisabled()`,
    `expect(element).toHaveProperty('checked', true)`,
  ],

  invalid: [
    {
      code: "expect(element).toHaveProperty('disabled', true)",
      errors: [
        {
          message:
            "Use toBeDisabled() instead of toHaveProperty('disabled', true)",
        },
      ],
      output: 'expect(element).toBeDisabled()',
    },
    {
      code: "expect(element).toHaveProperty('disabled', false)",
      errors: [
        {
          message:
            "Use toBeEnabled() instead of toHaveProperty('disabled', false)",
        },
      ],
      output: 'expect(element).toBeEnabled()',
    },
    {
      code: "expect(element).toHaveAttribute('disabled', false)",
      errors: [
        {
          message:
            "Use toBeEnabled() instead of toHaveAttribute('disabled', false)",
        },
      ],
      output: 'expect(element).toBeEnabled()',
    },
    {
      code: "expect(element).toHaveProperty('disabled')",
      errors: [
        {
          message: "Use toBeDisabled() instead of toHaveProperty('disabled')",
        },
      ],
      output: 'expect(element).toBeDisabled()',
    },
    {
      code: "expect(element).toHaveAttribute('disabled')",
      errors: [
        {
          message: "Use toBeDisabled() instead of toHaveAttribute('disabled')",
        },
      ],
      output: 'expect(element).toBeDisabled()',
    },
    {
      code: "expect(element).not.toHaveAttribute('disabled')",
      errors: [
        {
          message:
            "Use toBeEnabled() instead of not.toHaveAttribute('disabled')",
        },
      ],
      output: 'expect(element).toBeEnabled()',
    },
    {
      code: "expect(element).not.toHaveProperty('disabled')",
      errors: [
        {
          message:
            "Use toBeEnabled() instead of not.toHaveProperty('disabled')",
        },
      ],
      output: 'expect(element).toBeEnabled()',
    },
    {
      code: 'expect(element).not.toBeEnabled()',
      errors: [
        {
          message: 'Use toBeDisabled() instead of not.toBeEnabled()',
        },
      ],
      output: 'expect(element).toBeDisabled()',
    },
  ],
});
