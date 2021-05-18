import rule, { RULE_NAME } from '../../../lib/rules/prefer-screen-queries';
import {
  ALL_QUERIES_COMBINATIONS,
  ALL_QUERIES_VARIANTS,
  combineQueries,
} from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const CUSTOM_QUERY_COMBINATIONS = combineQueries(ALL_QUERIES_VARIANTS, [
  'ByIcon',
]);

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
    ...CUSTOM_QUERY_COMBINATIONS.map(
      (query) => `
      import { render } from '@testing-library/react'
      import { ${query} } from 'custom-queries'

      test("imported custom queries, since they can't be used through screen", () => {
        render(foo)
        ${query}('bar')
      })
    `
    ),
    ...CUSTOM_QUERY_COMBINATIONS.map(
      (query) => `
      import { render } from '@testing-library/react'

      test("render-returned custom queries, since they can't be used through screen", () => {
        const { ${query} } = render(foo)
        ${query}('bar')
      })
    `
    ),
    ...CUSTOM_QUERY_COMBINATIONS.map((query) => ({
      settings: {
        'testing-library/custom-queries': [query, 'ByComplexText'],
      },
      code: `
      import { render } from '@testing-library/react'

      test("custom queries + custom-queries setting, since they can't be used through screen", () => {
        const { ${query} } = render(foo)
        ${query}('bar')
      })
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
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      settings: { 'testing-library/utils-module': 'test-utils' },
      code: `
        import { render as testUtilRender } from 'test-utils'
        import { render } from 'somewhere-else'
        const { ${queryMethod} } = render(foo)
        ${queryMethod}()`,
    })),
    ...ALL_QUERIES_COMBINATIONS.map((queryMethod) => ({
      settings: {
        'testing-library/custom-renders': ['customRender'],
      },
      code: `
        import { anotherRender } from 'whatever'
        const { ${queryMethod} } = anotherRender(foo)
        ${queryMethod}()`,
    })),
  ],

  invalid: [
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
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
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
          settings: { 'testing-library/utils-module': 'test-utils' },
          code: `
        import { render } from 'test-utils'
        const { ${queryMethod} } = render(foo)
        ${queryMethod}()`,
          errors: [
            {
              line: 4,
              column: 9,
              messageId: 'preferScreenQueries',
              data: {
                name: queryMethod,
              },
            },
          ],
        } as const)
    ),

    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
          settings: {
            'testing-library/custom-renders': ['customRender'],
          },
          code: `
        import { customRender } from 'whatever'
        const { ${queryMethod} } = customRender(foo)
        ${queryMethod}()`,
          errors: [
            {
              line: 4,
              column: 9,
              messageId: 'preferScreenQueries',
              data: {
                name: queryMethod,
              },
            },
          ],
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
          settings: { 'testing-library/utils-module': 'test-utils' },
          code: `
        import { render as testingLibraryRender} from '@testing-library/react'
        const { ${queryMethod} } = testingLibraryRender(foo)
        ${queryMethod}()`,
          errors: [
            {
              line: 4,
              column: 9,
              messageId: 'preferScreenQueries',
              data: {
                name: queryMethod,
              },
            },
          ],
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
          settings: { 'testing-library/utils-module': 'test-utils' },
          code: `
        import { render } from 'test-utils'
        const { ${queryMethod} } = render(foo)
        ${queryMethod}()`,
          errors: [
            {
              line: 4,
              column: 9,
              messageId: 'preferScreenQueries',
              data: {
                name: queryMethod,
              },
            },
          ],
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
          code: `render().${queryMethod}()`,
          errors: [
            {
              messageId: 'preferScreenQueries',
              data: {
                name: queryMethod,
              },
            },
          ],
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
          code: `render(foo, { hydrate: true }).${queryMethod}()`,
          errors: [
            {
              messageId: 'preferScreenQueries',
              data: {
                name: queryMethod,
              },
            },
          ],
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
          code: `component.${queryMethod}()`,
          errors: [
            {
              messageId: 'preferScreenQueries',
              data: {
                name: queryMethod,
              },
            },
          ],
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
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
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
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
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
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
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
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
        } as const)
    ),
    ...ALL_QUERIES_COMBINATIONS.map(
      (queryMethod) =>
        ({
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
        } as const)
    ),
    {
      code: ` // issue #367 - example A
      import { render } from '@testing-library/react';
      
      function setup() {
        return render(<div />);
      }
      
      it('foo', async () => {
        const { getByText } = await setup();
        expect(getByText('foo')).toBeInTheDocument();
      });
      
      it('bar', () => {
        const { getByText } = setup();
        expect(getByText('foo')).toBeInTheDocument();
      });
      `,
      errors: [
        {
          messageId: 'preferScreenQueries',
          line: 10,
          column: 16,
          data: {
            name: 'getByText',
          },
        },
        {
          messageId: 'preferScreenQueries',
          line: 15,
          column: 16,
          data: {
            name: 'getByText',
          },
        },
      ],
    },
    {
      code: ` // issue #367 - example B
      import { render } from '@testing-library/react';
      
      function setup() {
        return render(<div />);
      }
      
      it('foo', () => {
        const { getByText } = setup();
        expect(getByText('foo')).toBeInTheDocument();
      });
      
      it('bar', () => {
        const results = setup();
        const { getByText } = results;
        expect(getByText('foo')).toBe('foo');
      });
      `,
      errors: [
        {
          messageId: 'preferScreenQueries',
          line: 10,
          column: 16,
          data: {
            name: 'getByText',
          },
        },
        {
          messageId: 'preferScreenQueries',
          line: 16,
          column: 16,
          data: {
            name: 'getByText',
          },
        },
      ],
    },
  ],
});
