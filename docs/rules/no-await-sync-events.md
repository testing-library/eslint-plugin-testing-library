# Disallow unnecessary `await` for sync events (no-await-sync-events)

Ensure that sync events are not awaited unnecessarily.

## Rule Details

Functions in the event object provided by Testing Library, including
fireEvent and userEvent, do NOT return Promise, with an exception of
`userEvent.type`, which delays the promise resolve only if [`delay`
option](https://github.com/testing-library/user-event#typeelement-text-options) is specified.
Some examples are:

- `fireEvent.click`
- `fireEvent.select`
- `userEvent.tab`
- `userEvent.hover`

This rule aims to prevent users from waiting for those function calls.

Examples of **incorrect** code for this rule:

```js
const foo = async () => {
  // ...
  await fireEvent.click(button);
  // ...
};

const bar = () => {
  // ...
  await userEvent.tab();
  // ...
};

const baz = () => {
  // ...
  await userEvent.type(textInput, 'abc');
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

const baz = () => {
  // await userEvent.type only with delay option
  await userEvent.type(textInput, 'abc', {delay: 1000});
  userEvent.type(textInput, '123');
  // ...
};
```

## Notes

There is another rule `await-fire-event`, which is only in Vue Testing
Library. Please do not confuse with this rule.
