import rule, { RULE_NAME } from '../../../lib/rules/prefer-explicit-assert';
import { ALL_QUERIES_METHODS } from '../../../lib/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const COMBINED_QUERIES_METHODS = [...ALL_QUERIES_METHODS, 'ByIcon'];

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `get${queryMethod}('Hello')`,
      settings: {
        'testing-library/utils-module': 'test-utils',
      },
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `get${queryMethod}`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `
        const utils = render()
        utils.get${queryMethod}
      `,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `screen.get${queryMethod}`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(get${queryMethod}('foo')).toBeDefined()`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `
        const utils = render()
        expect(utils.get${queryMethod}('foo')).toBeDefined()
      `,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(screen.get${queryMethod}('foo')).toBeDefined()`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(getBy${queryMethod}('foo').bar).toBeInTheDocument()`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `
        async () => { 
          await waitForElement(() => get${queryMethod}('foo')) 
        }
      `,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `fireEvent.click(get${queryMethod}('bar'));`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `const quxElement = get${queryMethod}('qux')`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `() => { return get${queryMethod}('foo') }`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `function bar() { return get${queryMethod}('foo') }`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `const { get${queryMethod} } = render()`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `it('test', () => { const { get${queryMethod} } = render() })`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `it('test', () => { const [ get${queryMethod} ] = render() })`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `const a = [ get${queryMethod}('foo') ]`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `const a = { foo: get${queryMethod}('bar') }`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `query${queryMethod}("foo")`,
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `
        expect(get${queryMethod}('foo')).toBeTruthy()
        fireEvent.click(get${queryMethod}('bar'));
      `,
      options: [
        {
          assertion: 'toBeTruthy',
        },
      ],
    })),
    ...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(get${queryMethod}('foo')).toBeEnabled()`,
      options: [
        {
          assertion: 'toBeInTheDocument',
        },
      ],
    })),
  ],
  invalid: [
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          code: `get${queryMethod}('foo')`,
          errors: [
            {
              messageId: 'preferExplicitAssert',
            },
          ],
        } as const)
    ),
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          code: `
        const utils = render()
        utils.get${queryMethod}('foo')
      `,
          errors: [
            {
              messageId: 'preferExplicitAssert',
              line: 3,
              column: 15,
            },
          ],
        } as const)
    ),
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          code: `screen.get${queryMethod}('foo')`,
          errors: [
            {
              messageId: 'preferExplicitAssert',
              line: 1,
              column: 8,
            },
          ],
        } as const)
    ),
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          code: `
        () => {
          get${queryMethod}('foo')
          doSomething()

          get${queryMethod}('bar')
          const quxElement = get${queryMethod}('qux')
        }
      `,
          errors: [
            {
              messageId: 'preferExplicitAssert',
              line: 3,
            },
            {
              messageId: 'preferExplicitAssert',
              line: 6,
            },
          ],
        } as const)
    ),
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          settings: {
            'testing-library/utils-module': 'test-utils',
          },
          code: `
        import "test-utils"
        getBy${queryMethod}("Hello")
      `,
          errors: [
            {
              messageId: 'preferExplicitAssert',
            },
          ],
        } as const)
    ),
    {
      code: `getByIcon('foo')`, // custom `getBy` query extended through options
      errors: [
        {
          messageId: 'preferExplicitAssert',
        },
      ],
    },
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          code: `expect(get${queryMethod}('foo')).toBeDefined()`,
          options: [
            {
              assertion: 'toBeInTheDocument',
            },
          ],
          errors: [
            {
              messageId: 'preferExplicitAssertAssertion',
              data: { assertion: 'toBeInTheDocument' },
            },
          ],
        } as const)
    ),
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          code: `expect(get${queryMethod}('foo')).not.toBeNull()`,
          options: [
            {
              assertion: 'toBeInTheDocument',
            },
          ],
          errors: [
            {
              messageId: 'preferExplicitAssertAssertion',
              data: { assertion: 'toBeInTheDocument' },
            },
          ],
        } as const)
    ),
    ...COMBINED_QUERIES_METHODS.map(
      (queryMethod) =>
        ({
          code: `expect(get${queryMethod}('foo')).not.toBeFalsy()`,
          options: [
            {
              assertion: 'toBeInTheDocument',
            },
          ],
          errors: [
            {
              messageId: 'preferExplicitAssertAssertion',
              data: { assertion: 'toBeInTheDocument' },
            },
          ],
        } as const)
    ),
  ],
});
