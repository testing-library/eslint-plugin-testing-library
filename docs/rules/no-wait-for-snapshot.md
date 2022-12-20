# Ensures no snapshot is generated inside of a `waitFor` call (`testing-library/no-wait-for-snapshot`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

Ensure that no calls to `toMatchSnapshot` or `toMatchInlineSnapshot` are made from within a `waitFor` method (or any of the other async utility methods).

## Rule Details

The `waitFor()` method runs in a timer loop. So it'll retry every n amount of time.
If a snapshot is generated inside the wait condition, jest will generate one snapshot per each loop.

The problem then is the amount of loop ran until the condition is met will vary between different computers (or CI machines). This leads to tests that will regenerate a lot of snapshots until the condition is matched when devs run those tests locally updating the snapshots; e.g. devs cannot run `jest -u` locally, or it'll generate a lot of invalid snapshots which will fail during CI.

Note that this lint rule prevents from generating a snapshot from within any of the [async utility methods](https://testing-library.com/docs/dom-testing-library/api-async).

Examples of **incorrect** code for this rule:

```js
const foo = async () => {
	// ...
	await waitFor(() => expect(container).toMatchSnapshot());
	// ...
};

const bar = async () => {
	// ...
	await waitFor(() => expect(container).toMatchInlineSnapshot());
	// ...
};

const baz = async () => {
	// ...
	await wait(() => {
		expect(container).toMatchSnapshot();
	});
	// ...
};
```

Examples of **correct** code for this rule:

```js
const foo = () => {
	// ...
	expect(container).toMatchSnapshot();
	// ...
};

const bar = () => {
	// ...
	expect(container).toMatchInlineSnapshot();
	// ...
};
```

## Further Reading

- [Async Utilities](https://testing-library.com/docs/dom-testing-library/api-async)
