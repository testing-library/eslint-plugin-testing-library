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
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
      code: `within(component).${queryMethod}()`,
    })),
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
      code: `within(screen.${queryMethod}()).${queryMethod}()`,
    })),
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
      code: `
        const { ${queryMethod} } = within(screen.getByText('foo'))
        ${queryMethod}(baz)
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
      code: `
        const myWithinVariable = within(foo)
        myWithinVariable.${queryMethod}('baz')
      `,
    })),
    {
      code: `
        const screen = render(baz);
        screen.container.querySelector('foo');
      `
    },
    {
      code: `
        const screen = render(baz);
        screen.baseElement.querySelector('foo');
      `
    },
    {
      code: `
        const utils = render(baz);
        screen.rerender();
      `
    },
    {
      code: `
        const utils = render(baz);
        utils.unmount();
      `
    },
    {
      code: `
        const utils = render(baz);
        utils.asFragment();
      `
    }
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
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
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
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
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
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
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
    ...ALL_QUERIES_COMBINATIONS.map(queryMethod => ({
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
