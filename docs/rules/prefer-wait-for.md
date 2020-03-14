# Use `waitFor` instead of deprecated wait methods (prefer-wait-for)

Since dom-testing-library v7 new `waitFor` async util has been added. This new method satisfies the use cases of `wait`, `waitForElement`, and `waitForDomChange`, so those have been deprecated.

## Rule Details

This rule aims to use `waitFor` async util rather than previous deprecated ones.

Deprecated wait async utils are:

- `wait`
- `waitForElement`
- `waitForDomChange`

> This rule will auto fix deprecated async utils for you, including necessary empty callback for `waitFor`. This means `wait();` will be replaced with `waitFor(() => {});`

Examples of **incorrect** code for this rule:

```js
const foo = async () => {
  // new waitFor method
  await waitFor(() => {});

  // previous waitForElementToBeRemoved is not deprecated
  await waitForElementToBeRemoved(() => {});
};
```

Examples of **correct** code for this rule:

```js
const foo = async () => {
  await wait();
  await wait(() => {});
  await waitForElement(() => {});
  await waitForDomChange();
  await waitForDomChange(mutationObserverOptions);
  await waitForDomChange({ options: true });
};
```

## When Not To Use It

When using dom-testing-library (or any other Testing Library relying on dom-testing-library) prior to v7.

## Further Reading

- [dom-testing-library v7 release](https://github.com/testing-library/dom-testing-library/releases/tag/v7.0.0)
