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

const ALL_TESTING_LIBRARIES_WITH_CLEANUP = [
  '@testing-library/preact',
  '@testing-library/react',
  '@testing-library/svelte',
  '@testing-library/vue',
  '@marko/testing-library',
];

ruleTester.run('no-manual-cleanup', rule, {
  valid: [
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `import { render } from "${lib}"`,
    })),
    {
      code: `import { cleanup } from "any-other-library"`,
    },
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `import utils from "${lib}"`,
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `
        import utils from "${lib}"
        utils.render()
      `,
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `const { render, within } = require("${lib}")`,
    })),
    {
      code: `const { cleanup } = require("any-other-library")`,
    },
    {
      code: `
        const utils = require("any-other-library")
        utils.cleanup()
      `,
    },
    {
      // For test coverage
      code: `const utils = render("something")`,
    },
  ],
  invalid: [
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `import { render, cleanup } from "${lib}"`,
      errors: [
        {
          line: 1,
          column: 18, // error points to `cleanup`
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `import { cleanup as myCustomCleanup } from "${lib}"`,
      errors: [
        {
          line: 1,
          column: 10, // error points to `cleanup`
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `import utils, { cleanup } from "${lib}"`,
      errors: [
        {
          line: 1,
          column: 17, // error points to `cleanup`
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `
        import utils from "${lib}"
        afterEach(() => utils.cleanup())
      `,
      errors: [
        {
          line: 3,
          column: 31,
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `
        import utils from "${lib}"
        afterEach(utils.cleanup)
      `,
      errors: [
        {
          line: 3,
          column: 25,
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `const { cleanup } = require("${lib}")`,
      errors: [
        {
          line: 1,
          column: 9, // error points to `cleanup`
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `
        const utils = require("${lib}")
        afterEach(() => utils.cleanup())
      `,
      errors: [
        {
          line: 3,
          column: 31,
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
    ...ALL_TESTING_LIBRARIES_WITH_CLEANUP.map(lib => ({
      code: `
        const utils = require("${lib}")
        afterEach(utils.cleanup)
      `,
      errors: [
        {
          line: 3,
          column: 25,
          message:
            "`cleanup` is performed automatically by your test runner, you don't need manual cleanups.",
        },
      ],
    })),
  ],
});
