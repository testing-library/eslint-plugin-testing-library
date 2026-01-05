# testing-library/prefer-find-by

📝 Suggest using `find(All)By*` query instead of `waitFor` + `get(All)By*` to wait for elements.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

`findBy*` queries are a simple combination of `getBy*` queries and `waitFor`. The `findBy*` queries accept the `waitFor` options as the last argument. (i.e. `screen.findByText('text', queryOptions, waitForOptions)`)

## Rule details

This rule aims to use `findBy*` or `findAllBy*` queries to wait for elements, rather than using `waitFor`.
This rule analyzes those cases where `waitFor` is used with just one query method, in the form of an arrow function with only one statement (that is, without a block of statements). Given the callback could be more complex, this rule does not consider function callbacks or arrow functions with blocks of code.

Examples of **incorrect** code for this rule

```js
// arrow functions with one statement, using screen and any sync query method
const submitButton = await waitFor(() =>
	screen.getByRole('button', { name: /submit/i })
);
const submitButton = await waitFor(() =>
	screen.getAllByTestId('button', { name: /submit/i })
);

// arrow functions with one statement, calling any sync query method
const submitButton = await waitFor(() =>
	queryByLabel('button', { name: /submit/i })
);

const submitButton = await waitFor(() =>
	queryAllByText('button', { name: /submit/i })
);

// arrow functions with one statement, calling any sync query method with presence assertion
const submitButton = await waitFor(() =>
	expect(queryByLabel('button', { name: /submit/i })).toBeInTheDocument()
);

const submitButton = await waitFor(() =>
	expect(queryByLabel('button', { name: /submit/i })).not.toBeFalsy()
);

// unnecessary usage of waitFor with findBy*, which already includes waiting logic
await waitFor(async () => {
	const button = await findByRole('button', { name: 'Submit' });
	expect(button).toBeInTheDocument();
});
```

Examples of **correct** code for this rule:

```js
// using findBy* methods
const submitButton = await findByText('foo');
const submitButton = await screen.findAllByRole('table');

// using waitForElementToBeRemoved
await waitForElementToBeRemoved(() => screen.findAllByRole('button'));
await waitForElementToBeRemoved(() => queryAllByLabel('my label'));
await waitForElementToBeRemoved(document.querySelector('foo'));

// using waitFor with a function
await waitFor(function () {
	foo();
	return getByText('name');
});

// passing a reference of a function
function myCustomFunction() {
	foo();
	return getByText('name');
}
await waitFor(myCustomFunction);

// using waitFor with an arrow function with a code block
await waitFor(() => {
	baz();
	return queryAllByText('foo');
});

// using a custom arrow function
await waitFor(() => myCustomFunction());

// using expects inside waitFor
await waitFor(() => expect(screen.getByText('bar')).toBeDisabled());
await waitFor(() => expect(getAllByText('bar')).toBeDisabled());
```

## When Not To Use It

- Not encouraging use of `findBy` shortcut from testing library best practices

## Further Reading

- Documentation for [findBy\* queries](https://testing-library.com/docs/dom-testing-library/api-queries#findby)

- Common mistakes with RTL, by Kent C. Dodds: [Using waitFor to wait for elements that can be queried with find\*](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#using-waitfor-to-wait-for-elements-that-can-be-queried-with-find)
