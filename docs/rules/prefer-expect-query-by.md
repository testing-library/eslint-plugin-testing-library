# Disallow the use of `expect(getBy*)` (prefer-expect-query-by)

The (DOM) Testing Library support two types of queries: `getBy*` and `queryBy*`. Using `getBy*` throws an error in case the element is not found. This is useful when using method like `waitForElement`, which are `async` functions that will wait for the element to be found until a certain timeout, after that the test will fail.
However, when trying to assert if an element is not in the document, we can't use `getBy*` as the test will fail immediately. Instead it is recommended to use `queryBy*`, which does not throw and therefore we can assert that `expect(queryByText("Foo")).not.toBeInTheDocument()`.

## Rule details

This rule gives a notification whenever `expect(getBy*)` is used.

This rule is enabled by default.

### Default configuration

The following patterns is considered erroneous:

```js
test('some test', () => {
  expect(getByText('Foo')).not.toBeInTheDocument();
});
```

The following pattern is considered non erroneous:

```js
test('some test', async () => {
  expect(queryByText('Foo')).not.toBeInTheDocument();
});
```

## Further Reading

- [Appearance and Disappearance](https://testing-library.com/docs/guide-disappearance#asserting-elements-are-not-present)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
