# testing-library/await-async-utils

📝 Enforce promises from async utils to be awaited properly.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Ensure that promises returned by async utils are handled properly.

## Rule Details

Testing library provides several utilities for dealing with asynchronous code. These are useful to wait for an element until certain criteria or situation happens. The available async utils are:

- `waitFor`
- `waitForElementToBeRemoved`

This rule aims to prevent users from forgetting to handle the returned
promise from async utils, which could lead to
problems in the tests. The promise will be considered as handled when:

- using the `await` operator
- wrapped within `Promise.all` or `Promise.allSettled` methods
- chaining the `then`, `catch`, `finally` method
- chaining `resolves` or `rejects` from jest
- chaining `toResolve()` or `toReject()` from [jest-extended](https://github.com/jest-community/jest-extended#promise)
- chaining jasmine [async matchers](https://jasmine.github.io/api/edge/async-matchers.html)
- it's returned from a function (in this case, that particular function will be analyzed by this rule too)

Examples of **incorrect** code for this rule:

```js
test('something incorrectly', async () => {
	// ...
	waitFor(() => {});

	const [usernameElement, passwordElement] = waitFor(
		() => [
			getByLabelText(container, 'username'),
			getByLabelText(container, 'password'),
		],
		{ container }
	);

	waitFor(() => {}, { timeout: 100 });

	waitForElementToBeRemoved(() => document.querySelector('div.getOuttaHere'));

	// wrap an async util within a function...
	const makeCustomWait = () => {
		return waitForElementToBeRemoved(() =>
			document.querySelector('div.getOuttaHere')
		);
	};
	makeCustomWait(); // ...but not handling promise from it is incorrect
});
```

Examples of **correct** code for this rule:

```js
test('something correctly', async () => {
	// ...
	// `await` operator is correct
	await waitFor(() => getByLabelText('email'));

	const [usernameElement, passwordElement] = await waitFor(
		() => [
			getByLabelText(container, 'username'),
			getByLabelText(container, 'password'),
		],
		{ container }
	);

	// `then` chained method is correct
	waitFor(() => {}, { timeout: 100 })
		.then(() => console.log('DOM changed!'))
		.catch((err) => console.log(`Error you need to deal with: ${err}`));

	// wrap an async util within a function...
	const makeCustomWait = () => {
		return waitForElementToBeRemoved(() =>
			document.querySelector('div.getOuttaHere')
		);
	};
	await makeCustomWait(); // ...and handling promise from it is correct

	// using Promise.all combining the methods
	await Promise.all([
		waitFor(() => getByLabelText('email')),
		waitForElementToBeRemoved(() => document.querySelector('div.getOuttaHere')),
	]);

	// Using jest resolves or rejects
	expect(waitFor(() => getByLabelText('email'))).resolves.toBeUndefined();

	// Using jest-extended a toResolve/toReject matcher is also correct
	expect(waitFor(() => getByLabelText('email'))).toResolve();
});
```

## Further Reading

- [Async Utilities](https://testing-library.com/docs/dom-testing-library/api-async)
