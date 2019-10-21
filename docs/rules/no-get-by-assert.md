# Disallow `getBy*` queries as assertion method itself (no-get-by-assert)

Testing Library `getBy*` queries throw an error if the element is not
found. Some users like this behavior to use the query itself as an
assert for the element existence in their tests, but other users don't
and prefer to explicitly assert the element existence, so this rule is
for users from the latter.

## Rule Details

This rule aims to encourage users to explicitly assert existence of
elements in their tests rather than just use `getBy*` queries and expect
it doesn't throw an error so it's easier to understand what's the
expected behavior within the test.

Examples of **incorrect** code for this rule:

```js
// just calling `getBy*` query expecting not to throw an error as an
// assert-like method, without actually using the returned element
getByText('foo');
```

Examples of **correct** code for this rule:

```js
// wrapping the get query within a `expect` and use some matcher for
// making the assertion more explicit
expect(getByText('foo')).toBeDefined();

// even more explicit if you use `@testing-library/jest-dom` matcher
// for checking the element is present in the document
expect(getByText('foo')).toBeInTheDocument();

// Doing something with the element returned without asserting is absolutely fine
await waitForElement(() => getByText('foo'));
fireEvent.click(getByText('bar'));
const quxElement = getByText('qux');

// call directly something different than Testing Library query
getByNonTestingLibraryVariant('foo');
```

## When Not To Use It

If you prefer to use `getBy*` queries implicitly as an assert-like
method itself, then this rule is not recommended.

## Further Reading

- [getBy query](https://testing-library.com/docs/dom-testing-library/api-queries#getby)
