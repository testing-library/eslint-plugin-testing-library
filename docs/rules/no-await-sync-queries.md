# Disallow unnecessary `await` for sync queries (`testing-library/no-await-sync-queries`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

Ensure that sync queries are not awaited unnecessarily.

## Rule Details

Usual queries variants that Testing Library provides are synchronous and
don't need to wait for any element. Those queries are:

- `getBy*`
- `getByAll*`
- `queryBy*`
- `queryAllBy*`

This rule aims to prevent users from waiting for synchronous queries.

Examples of **incorrect** code for this rule:

```js
const foo = async () => {
  // ...
  const rows = await queryAllByRole('row');
  // ...
};

const bar = () => {
  // ...
  getByText('submit').then(() => {
    // ...
  });
};

const baz = () => {
  // ...
  const button = await screen.getByText('submit');
};
```

Examples of **correct** code for this rule:

```js
const foo = () => {
	// ...
	const rows = queryAllByRole('row');
	// ...
};

const bar = () => {
	// ...
	const button = getByText('submit');
	// ...
};

const baz = () => {
	// ...
	const button = screen.getByText('submit');
};
```

## Further Reading

- [Sync queries variants](https://testing-library.com/docs/dom-testing-library/api-queries#variants)
- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
