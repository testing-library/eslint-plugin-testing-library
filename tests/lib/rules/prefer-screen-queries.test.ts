import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/prefer-screen-queries';
import { ALL_QUERIES_COMBINATIONS } from '../../../lib/utils';

const ruleTester = createRuleTester();

const ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER = [...ALL_QUERIES_COMBINATIONS, 'container']

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `screen.${queryMethod}()`,
    })),
    {
      code: `otherFunctionShouldNotThrow()`,
    },
    {
      code: `component.otherFunctionShouldNotThrow()`,
    },
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `within(component).${queryMethod}()`,
    })),
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `within(screen.${queryMethod}()).${queryMethod}()`,
    })),
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `
        const { ${queryMethod} } = within(screen.getByText('foo'))
        ${queryMethod}(baz)
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `
        const myWithinVariable = within(foo)
        myWithinVariable.${queryMethod}('baz')
      `,
    })),
  ],

  invalid: [
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
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

    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `render().${queryMethod}()`,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),

    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
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
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `
        const { ${queryMethod} } = render()
        ${queryMethod}(baz)
      `,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `
        const myRenderVariable = render()
        myRenderVariable.${queryMethod}(baz)
      `,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `
        const [myVariable] = render()
        myVariable.${queryMethod}(baz)
      `,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),
    ...ALL_QUERIES_COMBINATIONS_PLUS_CONTAINER.map(queryMethod => ({
      code: `
        const [myVariable] = within()
        myVariable.${queryMethod}(baz)
      `,
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
