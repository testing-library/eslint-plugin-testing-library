# Disallow the use of `expect(getBy*)` when elements are not present (no-get-by-for-asserting-element-not-present)

The (DOM) Testing Library allows to query DOM elements using different types of queries such as `getBy*` and `queryBy*`. Using `getBy*` throws an error in case the element is not found. This is useful when:

- using method like `waitForElement`, which are `async` functions that will wait for the element to be found until a certain timeout, after that the test will fail.
- using `getBy` queries as an assert itself, so if the element is not found the error thrown will work as the check itself within the test.

However, when trying to assert if an element is not present or disappearance, using `getBy*` will make the test fail immediately. Instead it is recommended to use `queryBy*`, which does not throw and therefore we can assert that e.g. `expect(queryByText("Foo")).not.toBeInTheDocument()`.

> The same applies for the `getAll*` and `queryAll*` queries too.

## Rule details

This rule gives a notification whenever `expect` is used with one of the query functions that throws an error if the element is not found.

Examples of **incorrect** code for this rule:

```js
test('some test', () => {
  const { getByText, getAllByText } = render(<App />);
  expect(getByText('Foo')).not.toBeInTheDocument();
  expect(getAllByText('Foo')[0]).toBeNull();
  expect(getByText('Foo')).toBeFalsy();
  expect(getAllByText('Foo')[0]).not.toBeTruthy();
  expect(getByText('Foo')).toBeUndefined();
});
```

```js
test('some test', async () => {
  const utils = render(<App />);
  await waitForElementToBeRemoved(() => {
    expect(utils.getByText('Foo')).toBeInTheDocument();
  });
  await waitForElementToBeRemoved(() => {
    expect(utils.getAllByText('Foo')).toBeInTheDocument();
  });
});
```

Examples of **correct** code for this rule:

```js
test('some test', () => {
  const { getByText, getAllByText } = render(<App />);
  expect(getByText('Foo')).toBeInTheDocument();
  expect(getAllByText('Foo')).toBeTruthy();
});
```

```js
test('some test', async () => {
  const utils = render(<App />);
  await waitForElementToBeRemoved(() => utils.queryByText('Foo'));
  await waitForElementToBeRemoved(() => utils.queryAllByText('Foo'));
});
```

## Further Reading

- [Asserting elements are not present](https://testing-library.com/docs/guide-disappearance#asserting-elements-are-not-present)
- [Waiting for disappearance](https://testing-library.com/docs/guide-disappearance#waiting-for-disappearance)
- [jest-dom note about using `getBy` within assertions](https://testing-library.com/docs/ecosystem-jest-dom)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
