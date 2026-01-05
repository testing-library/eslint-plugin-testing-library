# testing-library/prefer-query-by-disappearance

📝 Suggest using `queryBy*` queries when waiting for disappearance.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

<!-- end auto-generated rule header -->

## Rule Details

This rule enforces using `queryBy*` queries when waiting for disappearance with `waitForElementToBeRemoved`.

Using `queryBy*` queries in a `waitForElementToBeRemoved` yields more descriptive error messages and helps to achieve more consistency in a codebase.

```js
// TestingLibraryElementError: Unable to find an element by: [data-testid="loader"]
await waitForElementToBeRemoved(screen.getByTestId('loader'));

// The element(s) given to waitForElementToBeRemoved are already removed.
// waitForElementToBeRemoved requires that the element(s) exist(s) before waiting for removal.
await waitForElementToBeRemoved(screen.queryByTestId('loader'));
```

Example of **incorrect** code for this rule:

```js
await waitForElementToBeRemoved(() => screen.getByText('hello'));
await waitForElementToBeRemoved(() => screen.findByText('hello'));

await waitForElementToBeRemoved(screen.getByText('hello'));
await waitForElementToBeRemoved(screen.findByText('hello'));
```

Examples of **correct** code for this rule:

```js
await waitForElementToBeRemoved(() => screen.queryByText('hello'));
await waitForElementToBeRemoved(screen.queryByText('hello'));
```
