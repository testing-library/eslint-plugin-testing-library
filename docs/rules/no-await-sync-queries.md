# testing-library/no-await-sync-queries

📝 Disallow unnecessary `await` for sync queries.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

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
