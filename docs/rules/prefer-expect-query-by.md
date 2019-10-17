# Disallow the use of `expect(getBy*)` (prefer-expect-query-by)

The (DOM) Testing Library allows to query DOM elements using different types of queries such as `getBy*` and `queryBy*`. Using `getBy*` throws an error in case the element is not found. This is useful when using method like `waitForElement`, which are `async` functions that will wait for the element to be found until a certain timeout, after that the test will fail.
However, when trying to assert if an element is not in the document, we can't use `getBy*` as the test will fail immediately. Instead it is recommended to use `queryBy*`, which does not throw and therefore we can assert that e.g. `expect(queryByText("Foo")).not.toBeInTheDocument()`.

> The same applies for the `getAll*` and `queryAll*` queries.

## Rule details

This rule gives a notification whenever `expect` is used with one of the query functions that throw an error if the element is not found.

This rule is enabled by default.

Examples of **incorrect** code for this rule:

```js
test('some test', () => {
  const { getByText, getAllByText } = render(<App />);
  expect(getByText('Foo')).toBeInTheDocument();
  expect(getAllByText('Foo')[0]).toBeInTheDocument();
  expect(getByText('Foo')).not.toBeInTheDocument();
  expect(getAllByText('Foo')[0]).not.toBeInTheDocument();
});
```

```js
test('some test', () => {
  const rendered = render(<App />);
  expect(rendered.getByText('Foo')).toBeInTheDocument();
  expect(rendered.getAllByText('Foo')[0]).toBeInTheDocument();
  expect(rendered.getByText('Foo')).not.toBeInTheDocument();
  expect(rendered.getAllByText('Foo')[0]).not.toBeInTheDocument();
});
```

Examples of **correct** code for this rule:

```js
test('some test', () => {
  const { queryByText, queryAllByText } = render(<App />);
  expect(queryByText('Foo')).toBeInTheDocument();
  expect(queryAllByText('Foo')[0]).toBeInTheDocument();
  expect(queryByText('Foo')).not.toBeInTheDocument();
  expect(queryAllByText('Foo')[0]).not.toBeInTheDocument();
});
```

```js
test('some test', () => {
  const rendered = render(<App />);
  expect(rendered.queryByText('Foo')).toBeInTheDocument();
  expect(rendered.queryAllByText('Foo')[0]).toBeInTheDocument();
  expect(rendered.queryByText('Foo')).not.toBeInTheDocument();
  expect(rendered.queryAllByText('Foo')[0]).not.toBeInTheDocument();
});
```

## Further Reading

- [Appearance and Disappearance](https://testing-library.com/docs/guide-disappearance#asserting-elements-are-not-present)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
