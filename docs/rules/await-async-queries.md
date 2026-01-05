# testing-library/await-async-queries

📝 Enforce promises from async queries to be handled.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

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
- chaining the `then`, `catch`, `finally` method
- chaining `resolves` or `rejects` from jest
- chaining `toResolve()` or `toReject()` from [jest-extended](https://github.com/jest-community/jest-extended#promise)
- chaining jasmine [async matchers](https://jasmine.github.io/api/edge/async-matchers.html)
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
