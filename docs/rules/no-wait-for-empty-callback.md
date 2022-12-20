# Disallow empty callbacks for `waitFor` and `waitForElementToBeRemoved` (`testing-library/no-wait-for-empty-callback`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to ensure the correct usage of `waitFor` and `waitForElementToBeRemoved`, in the way that they're intended to be used.
If an empty callback is passed, these methods will just wait next tick of the event loop before proceeding, and that's not consistent with the philosophy of the library.
**Instead, insert an assertion in that callback function.**

Examples of **incorrect** code for this rule:

```js
const foo = async () => {
	await waitFor(() => {});
	await waitFor(function () {});
	await waitFor(noop);

	await waitForElementToBeRemoved(() => {});
	await waitForElementToBeRemoved(function () {});
	await waitForElementToBeRemoved(noop);
};
```

Examples of **correct** code for this rule:

```js
const foo = async () => {
	await waitFor(() => {
		screen.getByText(/submit/i);
	});

	const submit = screen.getByText(/submit/i);
	await waitForElementToBeRemoved(() => submit);
	// or
	await waitForElementToBeRemoved(submit);
};
```

## Further Reading

- [dom-testing-library v7 release](https://github.com/testing-library/dom-testing-library/releases/tag/v7.0.0)
- [inspiration for this rule](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#passing-an-empty-callback-to-waitfor)
