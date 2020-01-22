# Enforce async queries to have proper `await` (await-async-query)

Ensure that promises returned by async queries are handled properly.

## Rule Details

Some of the queries variants that Testing Library provides are
asynchronous as they return a promise which resolves when elements are
found. Those queries variants are:

- `findBy*`
- `findByAll*`

This rule aims to prevent users from forgetting to await the returned
promise from those async queries to be fulfilled, which could lead to
errors in the tests. The promises can be handled by using either `await`
operator or `then` method.

Examples of **incorrect** code for this rule:

```js
const foo = () => {
  // ...
  const rows = findAllByRole('row');
  // ...
};

const bar = () => {
  // ...
  findByText('submit');
  // ...
};
```

Examples of **correct** code for this rule:

```js
// `await` operator is correct
const foo = async () => {
  // ...
  const rows = await findAllByRole('row');
  // ...
};

// `then` method is correct
const bar = () => {
  // ...
  findByText('submit').then(() => {
    // ...
  });
};

// return the promise within a function is correct too!
const findMyButton = () => findByText('my button');

// using a resolves/rejects matcher is also correct
expect(findByTestId('alert')).resolves.toBe('Success');
expect(findByTestId('alert')).rejects.toBe('Error');
```

## Further Reading

- [Async queries variants](https://testing-library.com/docs/dom-testing-library/api-queries#findby)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
