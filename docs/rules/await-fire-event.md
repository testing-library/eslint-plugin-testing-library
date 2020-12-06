# Enforce promises from fire event methods to be handled (await-fire-event)

Ensure that promises returned by `fireEvent` methods are handled
properly.

## Rule Details

This rule aims to prevent users from forgetting to handle promise returned from `fireEvent`
methods.

> ⚠️ `fireEvent` methods are async only on `@testing-library/vue` package

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
```

## When Not To Use It

`fireEvent` methods are only async in Vue Testing Library so if you are using another Testing Library module, you shouldn't use this rule.

## Further Reading

- [Vue Testing Library fireEvent](https://testing-library.com/docs/vue-testing-library/api#fireevent)
