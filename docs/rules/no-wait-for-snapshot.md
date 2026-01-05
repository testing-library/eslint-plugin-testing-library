# testing-library/no-wait-for-snapshot

📝 Ensures no snapshot is generated inside of a `waitFor` call.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

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
