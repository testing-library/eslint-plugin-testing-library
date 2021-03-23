# Disallow the use of `render` in setup functions (no-render-in-setup)

## Rule Details

This rule disallows the usage of `render` (or a custom render function) in setup functions (`beforeEach` and `beforeAll`) in favor of moving `render` closer to test assertions.

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
```

```js
const setup = () => render(<MyComponent />);

beforeEach(() => {
  setup();
});

it('Should have foo', () => {
  expect(screen.getByText('foo')).toBeInTheDocument();
});

it('Should have bar', () => {
  expect(screen.getByText('bar')).toBeInTheDocument();
});
```

```js
beforeAll(() => {
  render(<MyComponent />);
});

it('Should have foo', () => {
  expect(screen.getByText('foo')).toBeInTheDocument();
});

it('Should have bar', () => {
  expect(screen.getByText('bar')).toBeInTheDocument();
});
```

Examples of **correct** code for this rule:

```js
it('Should have foo and bar', () => {
  render(<MyComponent />);
  expect(screen.getByText('foo')).toBeInTheDocument();
  expect(screen.getByText('bar')).toBeInTheDocument();
});
```

```js
const setup = () => render(<MyComponent />);

beforeEach(() => {
  // other stuff...
});

it('Should have foo and bar', () => {
  setup();
  expect(screen.getByText('foo')).toBeInTheDocument();
  expect(screen.getByText('bar')).toBeInTheDocument();
});
```

If you would like to allow the use of `render` (or a custom render function) in _either_ `beforeAll` or `beforeEach`, this can be configured using the option `allowTestingFrameworkSetupHook`. This may be useful if you have configured your tests to [skip auto cleanup](https://testing-library.com/docs/react-testing-library/setup#skipping-auto-cleanup). `allowTestingFrameworkSetupHook` is an enum that accepts either `"beforeAll"` or `"beforeEach"`.

```
   "testing-library/no-render-in-setup": ["error", {"allowTestingFrameworkSetupHook": "beforeAll"}],
```
