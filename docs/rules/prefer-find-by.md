# Suggest using `find(All)By*` query instead of `waitFor` + `get(All)By*` to wait for elements (`testing-library/prefer-find-by`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

`findBy*` queries are a simple combination of `getBy*` queries and `waitFor`. The `findBy*` queries accept the `waitFor` options as the last argument. (i.e. `screen.findByText('text', queryOptions, waitForOptions)`)

## Rule details

This rule aims to use `findBy*` or `findAllBy*` queries to wait for elements, rather than using `waitFor`, or the deprecated methods `waitForElement` and `wait`.
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
