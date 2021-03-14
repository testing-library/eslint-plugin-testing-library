import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/prefer-screen-queries';
import { ALL_QUERIES_COMBINATIONS } from '../../../lib/utils';

const ruleTester = createRuleTester();

// TODO: include custom queries in test cases

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `const baz = () => 'foo'`,
    },
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `screen.${queryMethod}()`,
    })),
    {
      code: `otherFunctionShouldNotThrow()`,
    },
    {
      code: `component.otherFunctionShouldNotThrow()`,
    },
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `within(component).${queryMethod}()`,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `within(screen.${queryMethod}()).${queryMethod}()`,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        const { ${queryMethod} } = within(screen.getByText('foo'))
        ${queryMethod}(baz)
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        const myWithinVariable = within(foo)
        myWithinVariable.${queryMethod}('baz')
      `,
    })),
    {
      code: `
        const screen = render(baz);
        screen.container.querySelector('foo');
      `,
    },
    {
      code: `
        const screen = render(baz);
        screen.baseElement.querySelector('foo');
      `,
    },
    {
      code: `
        const { rerender } = render(baz);
        rerender();
      `,
    },
    {
      code: `
        const utils = render(baz);
        utils.rerender();
      `,
    },
    {
      code: `
        const utils = render(baz);
        utils.asFragment();
      `,
    },
    {
      code: `
        const { asFragment } = render(baz);
        asFragment();
      `,
    },
    {
      code: `
        const { unmount } = render(baz);
        unmount();
      `,
    },
    {
      code: `
        const utils = render(baz);
        utils.unmount();
      `,
    },
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
      code: `
        const { ${queryMethod} } = render(baz, { baseElement: treeA })
        expect(${queryMethod}(baz)).toBeDefined()
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
      code: `
        const { ${queryMethod}: aliasMethod } = render(baz, { baseElement: treeA })
        expect(aliasMethod(baz)).toBeDefined()
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
      code: `
        const { ${queryMethod} } = render(baz, { container: treeA })
        expect(${queryMethod}(baz)).toBeDefined()
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
      code: `
        const { ${queryMethod}: aliasMethod } = render(baz, { container: treeA })
        expect(aliasMethod(baz)).toBeDefined()
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
      code: `
        const { ${queryMethod} } = render(baz, { baseElement: treeB, container: treeA })
        expect(${queryMethod}(baz)).toBeDefined()
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
      code: `
        const { ${queryMethod}: aliasMethod } = render(baz, { baseElement: treeB, container: treeA })
        expect(aliasMethod(baz)).toBeDefined()
      `,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod: string) => ({
      code: `
        render(foo, { baseElement: treeA }).${queryMethod}()
      `,
    })),
  ],

  invalid: [
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        const { ${queryMethod} } = render(foo)
        ${queryMethod}()`,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
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
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `render(foo, { hydrate: true }).${queryMethod}()`,
      errors: [
        {
          messageId: 'preferScreenQueries',
          data: {
            name: queryMethod,
          },
        },
      ],
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
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
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
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
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
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
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
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
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      code: `
        const { ${queryMethod} } = render(baz, { hydrate: true })
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
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
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
