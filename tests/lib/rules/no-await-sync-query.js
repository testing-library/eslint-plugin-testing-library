/**
 * @fileoverview Disallow unnecessary `await` for sync queries
 * @author Mario
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

var rule = require('../../../lib/rules/no-await-sync-query');
var RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run('no-await-sync-query', rule, {
  valid: [
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      code: "await getByText('foo')",
      errors: [
        {
          message: 'Fill me in.',
          type: 'Me too',
        },
      ],
    },
  ],
});
