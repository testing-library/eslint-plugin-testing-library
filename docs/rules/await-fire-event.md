# Enforce async fire event methods to be awaited (await-fire-event)

Ensure that promises returned by `fireEvent` methods are awaited
properly.

## Rule Details

This rule aims to prevent users from forgetting to await `fireEvent`
methods when they are async.

Examples of **incorrect** code for this rule:

```js
fireEvent.click(getByText('Click me'));

fireEvent.focus(getByLabelText('username'));
fireEvent.blur(getByLabelText('username'));
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
function clickMeRegularFn() {
  return fireEvent.click(getByText('Click me'));
}
const clickMeArrowFn = () => fireEvent.click(getByText('Click me'));
```

## When Not To Use It

`fireEvent` methods are only async in Vue Testing Library so if you are using another Testing Library module, you shouldn't use this rule.

## Further Reading

- [Vue Testing Library fireEvent](https://testing-library.com/docs/vue-testing-library/api#fireevent)
