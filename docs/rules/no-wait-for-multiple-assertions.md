# testing-library/no-wait-for-multiple-assertions

📝 Disallow the use of multiple `expect` calls inside `waitFor`.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

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
