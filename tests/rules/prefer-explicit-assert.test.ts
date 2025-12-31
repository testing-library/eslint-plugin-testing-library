import rule from '../../src/rules/prefer-explicit-assert';
import { ALL_QUERIES_METHODS } from '../../src/utils';
import { createRuleTester } from '../test-utils';

const ruleTester = createRuleTester();

const COMBINED_QUERIES_METHODS = [...ALL_QUERIES_METHODS, 'ByIcon'];

ruleTester.run(rule.name, rule, {
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
			code: `
      async () => {
        const quxElement = await find${queryMethod}('qux')
      }`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      async () => {
        expect(await find${queryMethod}('qux')).toBeInTheDocument();
      }`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
        async () => {
          await find${queryMethod}('foo')
        }`,
			options: [
				{
					includeFindQueries: false,
				},
			],
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `const quxElement = find${queryMethod}('qux')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `const quxElement = screen.find${queryMethod}('qux')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      async () => {
        const quxElement = await screen.find${queryMethod}('qux')
      }`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      function findBySubmit() {
        return screen.find${queryMethod}('foo')
      }`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      function findBySubmit() {
        return find${queryMethod}('foo')
      }`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      () => { return screen.find${queryMethod}('foo') }`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      () => { return find${queryMethod}('foo') }`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      () => screen.find${queryMethod}('foo')`,
		})),
		...COMBINED_QUERIES_METHODS.map((queryMethod) => ({
			code: `
      () => find${queryMethod}('foo')`,
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
		{
			// https://github.com/testing-library/eslint-plugin-testing-library/issues/475
			code: `
    // incomplete expect statement should be ignored
    expect('something');
    expect(getByText('foo'));
    `,
			options: [
				{
					assertion: 'toBeInTheDocument',
				},
			],
		},
	],
	invalid: [
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `get${queryMethod}('foo')`,
					errors: [
						{
							messageId: 'preferExplicitAssert',
							data: {
								queryType: 'getBy*',
							},
						},
					],
				}) as const
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `find${queryMethod}('foo')`,
					errors: [
						{
							messageId: 'preferExplicitAssert',
							data: { queryType: 'findBy*' },
						},
					],
				}) as const
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `screen.find${queryMethod}('foo')`,
					errors: [
						{
							messageId: 'preferExplicitAssert',
							data: { queryType: 'findBy*' },
						},
					],
				}) as const
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
        async () => {
          await screen.find${queryMethod}('foo')
        }
          `,
					errors: [
						{
							messageId: 'preferExplicitAssert',
							data: { queryType: 'findBy*' },
						},
					],
				}) as const
		),
		...COMBINED_QUERIES_METHODS.map(
			(queryMethod) =>
				({
					code: `
        async () => {
          await find${queryMethod}('foo')
        }
          `,
					errors: [
						{
							messageId: 'preferExplicitAssert',
							data: { queryType: 'findBy*' },
						},
					],
				}) as const
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
							data: {
								queryType: 'getBy*',
							},
						},
					],
				}) as const
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
							data: {
								queryType: 'getBy*',
							},
						},
					],
				}) as const
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
							data: {
								queryType: 'getBy*',
							},
						},
						{
							messageId: 'preferExplicitAssert',
							line: 6,
							data: {
								queryType: 'getBy*',
							},
						},
					],
				}) as const
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
							data: {
								queryType: 'getBy*',
							},
						},
					],
				}) as const
		),
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
				}) as const
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
				}) as const
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
				}) as const
		),
	],
});
