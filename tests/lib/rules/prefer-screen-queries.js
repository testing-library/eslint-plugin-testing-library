'use strict';

const rule = require('../../../lib/rules/prefer-screen-queries');
const { ALL_QUERIES_COMBINATIONS } = require('../../../lib/utils');
const RuleTester = require('eslint').RuleTester;

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2018 } });
ruleTester.run('prefer-screen-queries', rule, {
  valid: [
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
      code: `screen.${queryMethod}()`,
    })),
    {
      code: `otherFunctionShouldNotThrow()`,
    },
    {
      code: `component.otherFunctionShouldNotThrow()`,
    },
  ],

  invalid: [
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
      code: `${queryMethod}()`,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),

    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
      code: `component.${queryMethod}()`,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),
  ],
});
