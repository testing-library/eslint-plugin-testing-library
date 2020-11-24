# Enforce promise from async queries to be handled (await-async-query)

Ensure that promises returned by async queries are handled properly.

## Rule Details

Some of the queries variants that Testing Library provides are
asynchronous as they return a promise which resolves when elements are
found. Those queries variants are:

- `findBy*`
- `findAllBy*`

This rule aims to prevent users from forgetting to handle the returned
promise from those async queries to be fulfilled, which could lead to
errors in the tests. The promise will be considered as handled when:

- using `await` operator
- chaining `then` method
- chaining `resolves` or `rejects` from jest
- is returned from a function (in this case, that particular function will be analyzed by this rule too)

Examples of **incorrect** code for this rule:

```js
// async query without handling promise
const rows = findAllByRole('row');

findByIcon('search');

screen.findAllByPlaceholderText('name');
```

```js
// promise from async query returned within wrapper function without being handled
const findMyButton = () => findByText('my button');

const someButton = findMyButton(); // promise unhandled here
```

Examples of **correct** code for this rule:

```js
// `await` operator is correct
const rows = await findAllByRole('row');

await screen.findAllByPlaceholderText('name');

const promise = findByIcon('search');
const element = await promise;
```

```js
// `then` method is correct
findByText('submit').then(() => {});

const promise = findByRole('button');
promise.then(() => {});
```

```js
// return the promise within a function is correct too!
const findMyButton = () => findByText('my button');
```

```js
// promise from async query returned within wrapper function being handled
const findMyButton = () => findByText('my button');

const someButton = await findMyButton();
```

```js
// using a resolves/rejects matcher is also correct
expect(findByTestId('alert')).resolves.toBe('Success');
expect(findByTestId('alert')).rejects.toBe('Error');
```

```js
// sync queries don't need to handle any promise
const element = getByRole('role');
```

## Further Reading

- [Async queries variants](https://testing-library.com/docs/dom-testing-library/api-queries#findby)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
