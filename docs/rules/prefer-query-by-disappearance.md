# Suggest using `queryBy*` queries when waiting for disappearance (`testing-library/prefer-query-by-disappearance`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

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
