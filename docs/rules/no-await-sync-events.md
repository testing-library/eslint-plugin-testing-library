# Disallow unnecessary `await` for sync events (`testing-library/no-await-sync-events`)

<!-- end auto-generated rule header -->

Ensure that sync simulated events are not awaited unnecessarily.

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

- `eventModules`: array of strings. The possibilities are: `"fire-event"` and `"user-event"`. Defaults to `["fire-event", "user-event"]`

### `eventModules`

This option gives you more granular control of which event modules you want to report, so you can choose to only report methods from either `fire-event`, `user-event` or both.

Example:

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

## Notes

- Since `user-event` v14 all its methods are async, so you should disable reporting them by setting the `eventModules` to just `"fire-event"` so `user-event` methods are not reported.
- There is another rule `await-fire-event`, which is only in Vue Testing
  Library. Please do not confuse with this rule.
