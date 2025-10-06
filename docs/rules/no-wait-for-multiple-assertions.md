# Disallow the use of multiple `expect` calls inside `waitFor` (`testing-library/no-wait-for-multiple-assertions`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `svelte`, `vue`.

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to ensure the correct usage of `expect` inside `waitFor`, in the way that they're intended to be used.

If you use multiple assertions against the **same asynchronous target** inside `waitFor`,
you may have to wait for a timeout before seeing a test failure, which is inefficient.
Therefore, you should avoid using multiple assertions on the same async target inside a single `waitFor` callback.

However, multiple assertions against **different async targets** (for example, independent state updates or different function calls) are allowed.
This avoids unnecessary verbosity and maintains readability, without increasing the risk of missing failures.

Example of **incorrect** code for this rule:

```js
const foo = async () => {
	await waitFor(() => {
		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('/foo');
	});

	// or
	await waitFor(function () {
		expect(window.fetch).toHaveBeenCalledTimes(1);
		expect(window.fetch).toHaveBeenCalledWith('/foo');
	});
};
```

Examples of **correct** code for this rule:

```js
const foo = async () => {
	await waitFor(() => expect(window.fetch).toHaveBeenCalledTimes(1);
	expect(window.fetch).toHaveBeenCalledWith('/foo');

	// or
	await waitFor(function () {
		expect(window.fetch).toHaveBeenCalledTimes(1);
	});
	expect(window.fetch).toHaveBeenCalledWith('/foo');

	// it only detects expect
	// so this case doesn't generate warnings
	await waitFor(() => {
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(window.fetch).toHaveBeenCalledTimes(1);
	});

	// different async targets so the rule does not report it
	await waitFor(() => {
		expect(window.fetch).toHaveBeenCalledWith('/foo');
		expect(localStorage.setItem).toHaveBeenCalledWith('bar', 'baz');
	});
};
```

## Further Reading

- [about `waitFor`](https://testing-library.com/docs/dom-testing-library/api-async#waitfor)
- [inspiration for this rule](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#having-multiple-assertions-in-a-single-waitfor-callback)
