'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/no-manual-cleanup');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('no-manual-cleanup', rule, {
  valid: [
    {
      code: `import { render } from "@testing-library/react"`,
    },
  ],
  invalid: [
    {
      code: `import { render, cleanup } from "@testing-library/react"`,
      errors: [
        {
          line: 1,
          column: 18, // error points to `cleanup`
          message:
            "`cleanup` is performed automatically after each test by @testing-library/react, you don't need manual cleanups.",
        },
      ],
    },
  ],
});
