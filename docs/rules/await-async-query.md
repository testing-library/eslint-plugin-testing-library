# Enforce promises from async queries to be handled (`testing-library/await-async-query`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

Ensure that promises returned by async queries are handled properly.

## Rule Details

Some queries variants that Testing Library provides are
asynchronous as they return a promise which resolves when elements are
found. Those queries variants are:

- `findBy*`
- `findAllBy*`

This rule aims to prevent users from forgetting to handle the returned
promise from those async queries, which could lead to
problems in the tests. The promise will be considered as handled when:

- using the `await` operator
- wrapped within `Promise.all` or `Promise.allSettled` methods
- chaining the `then` method
- chaining `resolves` or `rejects` from jest
- chaining `toResolve()` or `toReject()` from [jest-extended](https://github.com/jest-community/jest-extended#promise)
- it's returned from a function (in this case, that particular function will be analyzed by this rule too)

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
// several promises handled with `Promise.all` is correct
await Promise.all([findByText('my button'), findByText('something else')]);
```

```js
// several promises handled `Promise.allSettled` is correct
await Promise.allSettled([
	findByText('my button'),
	findByText('something else'),
]);
```

```js
// using a resolves/rejects matcher is also correct
expect(findByTestId('alert')).resolves.toBe('Success');
expect(findByTestId('alert')).rejects.toBe('Error');
```

```js
// using a toResolve/toReject matcher is also correct
expect(findByTestId('alert')).toResolve();
expect(findByTestId('alert')).toReject();
```

```js
// sync queries don't need to handle any promise
const element = getByRole('role');
```

## Further Reading

- [Async queries variants](https://testing-library.com/docs/dom-testing-library/api-queries#findby)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
