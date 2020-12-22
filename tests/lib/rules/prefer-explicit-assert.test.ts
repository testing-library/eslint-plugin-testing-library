import { createRuleTester } from '../test-utils';
import rule, { RULE_NAME } from '../../../lib/rules/prefer-explicit-assert';
import { ALL_QUERIES_METHODS } from '../../../lib/utils';

const ruleTester = createRuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `get${queryMethod}('Hello')`,
      settings: {
        'testing-library/module': 'test-utils',
      },
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `get${queryMethod}`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `
        const utils = render()
        utils.get${queryMethod}
      `,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `screen.get${queryMethod}`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(get${queryMethod}('foo')).toBeDefined()`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `
        const utils = render()
        expect(utils.get${queryMethod}('foo')).toBeDefined()
      `,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(screen.get${queryMethod}('foo')).toBeDefined()`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(getBy${queryMethod}('foo').bar).toBeInTheDocument()`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `
        async () => { 
          await waitForElement(() => get${queryMethod}('foo')) 
        }
      `,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `fireEvent.click(get${queryMethod}('bar'));`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `const quxElement = get${queryMethod}('qux')`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `() => { return get${queryMethod}('foo') }`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `function bar() { return get${queryMethod}('foo') }`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `const { get${queryMethod} } = render()`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `it('test', () => { const { get${queryMethod} } = render() })`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `it('test', () => { const [ get${queryMethod} ] = render() })`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `const a = [ get${queryMethod}('foo') ]`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `const a = { foo: get${queryMethod}('bar') }`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `query${queryMethod}("foo")`,
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
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
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `expect(get${queryMethod}('foo')).toBeEnabled()`,
      options: [
        {
          assertion: 'toBeInTheDocument',
        },
      ],
    })),
  ],
  invalid: [
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `get${queryMethod}('foo')`,
      errors: [
        {
          messageId: 'preferExplicitAssert',
        },
      ],
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
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
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      code: `screen.get${queryMethod}('foo')`,
      errors: [
        {
          messageId: 'preferExplicitAssert',
          line: 1,
          column: 8,
        },
      ],
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
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
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
      settings: {
        'testing-library/module': 'test-utils',
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
    })),
    {
      code: `getByIcon('foo')`, // custom `getBy` query extended through options
      errors: [
        {
          messageId: 'preferExplicitAssert',
        },
      ],
    },
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
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
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
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
    })),
    ...ALL_QUERIES_METHODS.map((queryMethod) => ({
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
    })),
  ],
});
