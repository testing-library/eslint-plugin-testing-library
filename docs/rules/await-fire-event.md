# Enforce promises from `fireEvent` methods to be handled (`testing-library/await-fire-event`)

💼 This rule is enabled in the following configs: `marko`, `vue`.

<!-- end auto-generated rule header -->

Ensure that promises returned by `fireEvent` methods are handled
properly.

## Rule Details

This rule aims to prevent users from forgetting to handle promise returned from `fireEvent`
methods.
The promise will be considered as handled when:

- using the `await` operator
- wrapped within `Promise.all` or `Promise.allSettled` methods
- chaining the `then` method
- chaining `resolves` or `rejects` from jest
- chaining `toResolve()` or `toReject()` from [jest-extended](https://github.com/jest-community/jest-extended#promise)
- it's returned from a function (in this case, that particular function will be analyzed by this rule too)

> ⚠️ `fireEvent` methods are async only on following Testing Library packages:
>
> - `@testing-library/vue` (supported by this plugin)
> - `@testing-library/svelte` (not supported yet by this plugin)
> - `@marko/testing-library` (supported by this plugin)

Examples of **incorrect** code for this rule:

```js
fireEvent.click(getByText('Click me'));

fireEvent.focus(getByLabelText('username'));
fireEvent.blur(getByLabelText('username'));

// wrap a fireEvent method within a function...
function triggerEvent() {
	return fireEvent.click(button);
}
triggerEvent(); // ...but not handling promise from it is incorrect too
```

Examples of **correct** code for this rule:

```js
// `await` operator is correct
await fireEvent.focus(getByLabelText('username'));
await fireEvent.blur(getByLabelText('username'));

// `then` method is correct
fireEvent.click(getByText('Click me')).then(() => {
	// ...
});

// return the promise within a function is correct too!
const clickMeArrowFn = () => fireEvent.click(getByText('Click me'));

// wrap a fireEvent method within a function...
function triggerEvent() {
	return fireEvent.click(button);
}
await triggerEvent(); // ...and handling promise from it is correct also

// using `Promise.all` or `Promise.allSettled` with an array of promises is valid
await Promise.all([
	fireEvent.focus(getByLabelText('username')),
	fireEvent.blur(getByLabelText('username')),
]);

// Using jest resolves or rejects
expect(fireEvent.focus(getByLabelText('username'))).resolves.toBeUndefined();

// Using jest-extended a toResolve/toReject matcher is also correct
expect(waitFor(() => getByLabelText('email'))).toResolve();
```

## When Not To Use It

`fireEvent` methods are not async on all Testing Library packages. If you are not using Testing Library package with async fire event, you shouldn't use this rule.

## Further Reading

- [Vue Testing Library fireEvent](https://testing-library.com/docs/vue-testing-library/api#fireevent)
