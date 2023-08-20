# Enforce promises from async event methods are handled (`testing-library/await-async-events`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Ensure that promises returned by `userEvent` (v14+) async methods or `fireEvent` (only Vue and Marko) async methods are handled properly.

## Rule Details

This rule aims to prevent users from forgetting to handle promise returned from async event
methods.

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

```js
userEvent.click(getByText('Click me'));
userEvent.tripleClick(getByText('Click me'));
userEvent.keyboard('foo');

// wrap a userEvent method within a function...
function triggerEvent() {
	return userEvent.click(button);
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
```

```js
// `await` operator is correct
await userEvent.click(getByText('Click me'));
await userEvent.tripleClick(getByText('Click me'));

// `then` method is correct
userEvent.keyboard('foo').then(() => {
	// ...
});

// return the promise within a function is correct too!
const clickMeArrowFn = () => userEvent.click(getByText('Click me'));

// wrap a userEvent method within a function...
function triggerEvent() {
	return userEvent.click(button);
}
await triggerEvent(); // ...and handling promise from it is correct also

// using `Promise.all` or `Promise.allSettled` with an array of promises is valid
await Promise.all([
	userEvent.click(getByText('Click me'));
	userEvent.tripleClick(getByText('Click me'));
]);
```

## Options

- `eventModule`: `string` or `string[]`. Which event module should be linted for async event methods. Defaults to `userEvent` which should be used after v14. `fireEvent` should only be used with frameworks that have async fire event methods.

## Example

```json
{
	"testing-library/await-async-events": [
		2,
		{
			"eventModule": "userEvent"
		}
	]
}
```

```json
{
	"testing-library/await-async-events": [
		2,
		{
			"eventModule": "fireEvent"
		}
	]
}
```

```json
{
	"testing-library/await-async-events": [
		2,
		{
			"eventModule": ["fireEvent", "userEvent"]
		}
	]
}
```

## When Not To Use It

- `userEvent` is below v14, before all event methods are async
- `fireEvent` methods are sync for most Testing Library packages. If you are not using Testing Library package with async events, you shouldn't use this rule.

## Further Reading

- [Vue Testing Library fireEvent](https://testing-library.com/docs/vue-testing-library/api#fireevent)
