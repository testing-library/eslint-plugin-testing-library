# Disallow the use of `render` in setup functions (no-render-in-setup)

## Rule Details

This rule disallows the usage of `render` in setup functions (`beforeEach` or `beforeAll`) in favor of a single test with multiple assertions.

Examples of **incorrect** code for this rule:

```js
beforeEach(() => {
  render(<MyComponent />);
});

it('Should have foo', () => {
  expect(screen.getByText('foo')).toBeInTheDocument();
});

it('Should have bar', () => {
  expect(screen.getByText('bar')).toBeInTheDocument();
});

it('Should have baz', () => {
  expect(screen.getByText('baz')).toBeInTheDocument();
});
```

Examples of **correct** code for this rule:

```js
it('Should have foo, bar and baz', () => {
  render(<MyComponent />);
  expect(screen.getByText('foo')).toBeInTheDocument();
  expect(screen.getByText('bar')).toBeInTheDocument();
  expect(screen.getByText('baz')).toBeInTheDocument();
});
```

If you use [custom render functions](https://testing-library.com/docs/example-react-redux) then you can set a config option in your `.eslintrc` to look for these.

```
   "testing-library/no-render-in-setup": ["error", {"renderFunctions":["renderWithRedux", "renderWithRouter"]}],
```
