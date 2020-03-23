# Enforce specific queries when checking appearance or disappearance of elements (prefer-presence-queries)

The (DOM) Testing Library allows to query DOM elements using different types of queries such as `get*` and `query*`. Using `get*` throws an error in case the element is not found, while `query*` returns null instead of throwing (or empty array for `queryAllBy*` ones). These differences are useful in some situations:

- using `getBy*` queries when asserting if element is present, so if the element is not found the error thrown will offer better info than asserting with other queries which will not throw an error.
- using `queryBy*` queries when asserting if element is not present, so the test doesn't fail immediately when the element is not found and the assertion can be executed properly.

## Rule details

This rule fires whenever:

- `queryBy*` or `queryAllBy*` are used to assert element **is** present with `.toBeInTheDocument()`, `toBeTruthy()` or `.toBeDefined()` matchers or negated matchers from case below.
- `getBy*` or `getAllBy*` are used to assert element **is not** present with `.toBeNull()` or `.toBeFalsy()` matchers or negated matchers from case above.

Examples of **incorrect** code for this rule:

```js
test('some test', () => {
  render(<App />);

  // check element is present with `queryBy*`
  expect(screen.queryByText('button')).toBeInTheDocument();
  expect(screen.queryAllByText('button')[0]).toBeTruthy();
  expect(screen.queryByText('button')).toBeNull();
  expect(screen.queryAllByText('button')[2]).not.toBeNull();
  expect(screen.queryByText('button')).not.toBeFalsy();

  // check element is NOT present with `getBy*`
  expect(screen.getByText('loading')).not.toBeInTheDocument();
  expect(screen.getAllByText('loading')[1]).not.toBeTruthy();
  expect(screen.getByText('loading')).not.toBeNull();
  expect(screen.getAllByText('loading')[3]).toBeNull();
  expect(screen.getByText('loading')).toBeFalsy();
});
```

Examples of **correct** code for this rule:

```js
test('some test', async () => {
  render(<App />);
  // check element is present with `getBy*`
  expect(screen.getByText('button')).toBeInTheDocument();
  expect(screen.getAllByText('button')[9]).toBeTruthy();
  expect(screen.getByText('button')).toBeNull();
  expect(screen.getAllByText('button')[7]).not.toBeNull();
  expect(screen.getByText('button')).not.toBeFalsy();

  // check element is NOT present with `queryBy*`
  expect(screen.queryByText('loading')).not.toBeInTheDocument();
  expect(screen.queryAllByText('loading')[8]).not.toBeTruthy();
  expect(screen.queryByText('loading')).not.toBeNull();
  expect(screen.queryAllByText('loading')[6]).toBeNull();
  expect(screen.queryByText('loading')).toBeFalsy();

  // `findBy*` queries are out of the scope for this rule
  const button = await screen.findByText('submit');
  expect(button).toBeInTheDocument();
});
```

## Further Reading

- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
- [Waiting for appearance](https://testing-library.com/docs/guide-disappearance#waiting-for-appearance)
- [Asserting elements are not present](https://testing-library.com/docs/guide-disappearance#asserting-elements-are-not-present)
- [jest-dom note about using `getBy` within assertions](https://testing-library.com/docs/ecosystem-jest-dom)
