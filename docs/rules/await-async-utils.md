# Enforce promises from async utils to be awaited properly (`testing-library/await-async-utils`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

Ensure that promises returned by async utils are handled properly.

## Rule Details

Testing library provides several utilities for dealing with asynchronous code. These are useful to wait for an element until certain criteria or situation happens. The available async utils are:

- `waitFor` _(introduced since dom-testing-library v7)_
- `waitForElementToBeRemoved`
- `wait` _(**deprecated** since dom-testing-library v7)_
- `waitForElement` _(**deprecated** since dom-testing-library v7)_
- `waitForDomChange` _(**deprecated** since dom-testing-library v7)_

This rule aims to prevent users from forgetting to handle the returned
promise from async utils, which could lead to
problems in the tests. The promise will be considered as handled when:

- using the `await` operator
- wrapped within `Promise.all` or `Promise.allSettled` methods
- chaining the `then` method
- chaining `resolves` or `rejects` from jest
- chaining `toResolve()` or `toReject()` from [jest-extended](https://github.com/jest-community/jest-extended#promise)
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
