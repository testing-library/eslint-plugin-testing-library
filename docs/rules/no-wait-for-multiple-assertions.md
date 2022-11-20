# Disallow the use of multiple `expect` calls inside `waitFor` (`testing-library/no-wait-for-multiple-assertions`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to ensure the correct usage of `expect` inside `waitFor`, in the way that they're intended to be used.
When using multiples assertions inside `waitFor`, if one fails, you have to wait for a timeout before seeing it failing.
Putting one assertion, you can both wait for the UI to settle to the state you want to assert on,
and also fail faster if one of the assertions do end up failing

Example of **incorrect** code for this rule:

```js
const foo = async () => {
	await waitFor(() => {
		expect(a).toEqual('a');
		expect(b).toEqual('b');
	});

	// or
	await waitFor(function () {
		expect(a).toEqual('a');
		expect(b).toEqual('b');
	});
};
```

Examples of **correct** code for this rule:

```js
const foo = async () => {
	await waitFor(() => expect(a).toEqual('a'));
	expect(b).toEqual('b');

	// or
	await waitFor(function () {
		expect(a).toEqual('a');
	});
	expect(b).toEqual('b');

	// it only detects expect
	// so this case doesn't generate warnings
	await waitFor(() => {
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(b).toEqual('b');
	});
};
```

## Further Reading

- [about `waitFor`](https://testing-library.com/docs/dom-testing-library/api-async#waitfor)
- [inspiration for this rule](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#having-multiple-assertions-in-a-single-waitfor-callback)
