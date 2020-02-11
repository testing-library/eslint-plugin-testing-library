# Disallow the use of `getBy*` queries when checking elements are not present (no-get-by-for-checking-element-not-present)

The (DOM) Testing Library allows to query DOM elements using different types of queries such as `getBy*` and `queryBy*`. Using `getBy*` throws an error in case the element is not found. This is useful when:

- using method like `waitForElement`, which are `async` functions that will wait for the element to be found until a certain timeout, after that the test will fail.
- using `getBy` queries as an assert itself, so if the element is not found the error thrown will work as the check itself within the test.

However, when asserting if an element is not present or waiting for disappearance, using `getBy*` will make the test fail immediately. Instead it is recommended to use `queryBy*`, which does not throw and therefore we can:

- assert element does not exist: `expect(queryByText("Foo")).not.toBeInTheDocument()`
- wait for disappearance: `await waitForElementToBeRemoved(() => queryByText('the mummy'))`

## Rule details

This rule fires whenever:

- `expect` is used to assert element does not exist with `.not.toBeInTheDocument()` or `.toBeNull()` matchers
- `waitForElementToBeRemoved` async util is used to wait for element to be removed from DOM

Examples of **incorrect** code for this rule:

```js
test('some test', () => {
  const { getByText } = render(<App />);
  expect(getByText('Foo')).not.toBeInTheDocument();
  expect(getByText('Foo')).not.toBeTruthy();
  expect(getByText('Foo')).toBeFalsy();
  expect(getByText('Foo')).toBeNull();
});
```

```js
test('some test', async () => {
  const utils = render(<App />);
  await waitForElementToBeRemoved(() => utils.getByText('Foo'));
});
```

Examples of **correct** code for this rule:

```js
test('some test', () => {
  const { getByText } = render(<App />);
  expect(getByText('Foo')).toBeInTheDocument();
  expect(getByText('Foo')).not.toBeDisabled();
  expect(queryByText('Foo')).not.toBeInTheDocument();
  expect(queryByText('Foo')).toBeFalsy();
});
```

```js
test('some test', async () => {
  const utils = render(<App />);
  await waitForElementToBeRemoved(() => utils.queryByText('Foo'));
});
```

## Further Reading

- [Asserting elements are not present](https://testing-library.com/docs/guide-disappearance#asserting-elements-are-not-present)
- [Waiting for disappearance](https://testing-library.com/docs/guide-disappearance#waiting-for-disappearance)
- [jest-dom note about using `getBy` within assertions](https://testing-library.com/docs/ecosystem-jest-dom)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
