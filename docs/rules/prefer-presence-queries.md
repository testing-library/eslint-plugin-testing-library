# Enforce specific queries when checking appearance or disappearance of elements (prefer-presence-queries)

The (DOM) Testing Library allows to query DOM elements using different types of queries such as `getBy*` and `queryBy*`. Using `getBy*` throws an error in case the element is not found, while `queryBy` returns null instead of throwing. These differences are useful in some situations:

- using `getBy*` queries when asserting if element is present, so if the element is not found the error thrown will offer better info than asserting with other queries which not throw.
- using `queryBy*` queries when asserting if element is not present, so the test doesn't fail immediately when the element it's not found and the assertion can be executed properly.

## Rule details

This rule fires whenever:

- `queryBy*` is used to assert element **is** present with `.toBeInTheDocument()`, `toBeTruthy()` or `.toBeNull()` matchers or negated matchers from following case.
- `getBy*` is used to assert element **is not** present with `.toBeNull()` or `.toBeFalsy()` matchers or negated matchers from previous case.

Examples of **incorrect** code for this rule:

```js
test('some test', () => {
  render(<App />);

  // check element is present with `queryBy*`
  expect(screen.queryByText('button')).toBeInTheDocument();
  expect(screen.queryByText('button')).toBeTruthy();
  expect(screen.queryByText('button')).toBeNull();
  expect(screen.queryByText('button')).not.toBeNull();
  expect(screen.queryByText('button')).not.toBeFalsy();

  // check element is NOT present with `getBy*`
  expect(screen.getByText('loading')).not.toBeInTheDocument();
  expect(screen.getByText('loading')).not.toBeTruthy();
  expect(screen.getByText('loading')).not.toBeNull();
  expect(screen.getByText('loading')).toBeNull();
  expect(screen.getByText('loading')).toBeFalsy();
});
```

Examples of **correct** code for this rule:

```js
test('some test', () => {
  render(<App />);
  // check element is present with `getBy*`
  expect(screen.getByText('button')).toBeInTheDocument();
  expect(screen.getByText('button')).toBeTruthy();
  expect(screen.getByText('button')).toBeNull();
  expect(screen.getByText('button')).not.toBeNull();
  expect(screen.getByText('button')).not.toBeFalsy();

  // check element is NOT present with `queryBy*`
  expect(screen.queryByText('loading')).not.toBeInTheDocument();
  expect(screen.queryByText('loading')).not.toBeTruthy();
  expect(screen.queryByText('loading')).not.toBeNull();
  expect(screen.queryByText('loading')).toBeNull();
  expect(screen.queryByText('loading')).toBeFalsy();
});
```

## Further Reading

- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
- [Waiting for appearance](https://testing-library.com/docs/guide-disappearance#waiting-for-appearance)
- [Asserting elements are not present](https://testing-library.com/docs/guide-disappearance#asserting-elements-are-not-present)
- [jest-dom note about using `getBy` within assertions](https://testing-library.com/docs/ecosystem-jest-dom)
