import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/prefer-screen-queries';
import { ALL_QUERIES_COMBINATIONS } from '../../../lib/utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
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
