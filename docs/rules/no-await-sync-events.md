# Disallow unnecessary `await` for sync events (`testing-library/no-await-sync-events`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `react`.

<!-- end auto-generated rule header -->

Ensure that sync events are not awaited unnecessarily.

## Rule Details

Methods for simulating events in Testing Library ecosystem -`fireEvent` and `userEvent` prior to v14 -
do NOT return any Promise, with an exception of
`userEvent.type` and `userEvent.keyboard`, which delays the promise resolve only if [`delay`
option](https://github.com/testing-library/user-event#typeelement-text-options) is specified.

Some examples of simulating events not returning any Promise are:

- `fireEvent.click`
- `fireEvent.select`
- `userEvent.tab` (prior to `user-event` v14)
- `userEvent.hover` (prior to `user-event` v14)

This rule aims to prevent users from waiting for those function calls.

> ⚠️ `fire-event` methods are async only on following Testing Library packages:
>
> - `@testing-library/vue` (supported by this plugin)
> - `@testing-library/svelte` (not supported yet by this plugin)
> - `@marko/testing-library` (supported by this plugin)

Examples of **incorrect** code for this rule:

```js
const foo = async () => {
	// ...
	await fireEvent.click(button);
	// ...
};

const bar = async () => {
	// ...
	// userEvent prior to v14
	await userEvent.tab();
	// ...
};

const baz = async () => {
	// ...
	// userEvent prior to v14
	await userEvent.type(textInput, 'abc');
	await userEvent.keyboard('abc');
	// ...
};
```

Examples of **correct** code for this rule:

```js
const foo = () => {
	// ...
	fireEvent.click(button);
	// ...
};

const bar = () => {
	// ...
	userEvent.tab();
	// ...
};

const baz = async () => {
	// await userEvent.type only with delay option
	await userEvent.type(textInput, 'abc', { delay: 1000 });
	userEvent.type(textInput, '123');

	// same for userEvent.keyboard
	await userEvent.keyboard(textInput, 'abc', { delay: 1000 });
	userEvent.keyboard('123');
	// ...
};

const qux = async () => {
	// userEvent v14
	await userEvent.tab();
	await userEvent.click(button);
	await userEvent.type(textInput, 'abc');
	await userEvent.keyboard('abc');
	// ...
};
```

## Options

This rule provides the following options:

- `eventModules`: array of strings. Defines which event module should be linted for sync event methods. The possibilities are: `"fire-event"` and `"user-event"`. Defaults to `["fire-event"]`.

### Example:

```js
module.exports = {
	rules: {
		'testing-library/no-await-sync-events': [
			'error',
			{ eventModules: ['fire-event', 'user-event'] },
		],
	},
};
```

## When Not To Use It

- `"fire-event"` option: should be disabled only for those Testing Library packages where fire-event methods are async.
- `"user-event"` option: should be disabled only if using v14 or greater.

## Notes

There is another rule `await-async-events`, which is for awaiting async events for `user-event` v14 or `fire-event` only in Testing Library packages with async methods. Please do not confuse with this rule.
