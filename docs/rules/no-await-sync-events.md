# Disallow unnecessary `await` for sync events (`testing-library/no-await-sync-events`)

Ensure that sync simulated events are not awaited unnecessarily.

## Rule Details

Methods for simulating events in Testing Library ecosystem -`fireEvent` and `userEvent`-
do NOT return any Promise, with an exception of
`userEvent.type` and `userEvent.keyboard`, which delays the promise resolve only if [`delay`
option](https://github.com/testing-library/user-event#typeelement-text-options) is specified.

Some examples of simulating events not returning any Promise are:

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

const bar = async () => {
  // ...
  await userEvent.tab();
  // ...
};

const baz = async () => {
  // ...
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
```

## Notes

There is another rule `await-fire-event`, which is only in Vue Testing
Library. Please do not confuse with this rule.
