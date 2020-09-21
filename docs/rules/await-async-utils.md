# Enforce async utils to be awaited properly (await-async-utils)

Ensure that promises returned by async utils are handled properly.

## Rule Details

Testing library provides several utilities for dealing with asynchronous code. These are useful to wait for an element until certain criteria or situation happens. The available async utils are:

- `waitFor` _(introduced in dom-testing-library v7)_
- `waitForElementToBeRemoved`
- `wait` _(**deprecated** in dom-testing-library v7)_
- `waitForElement` _(**deprecated** in dom-testing-library v7)_
- `waitForDomChange` _(**deprecated** in dom-testing-library v7)_

This rule aims to prevent users from forgetting to handle the returned promise from those async utils, which could lead to unexpected errors in the tests execution. The promises can be handled by using either `await` operator or `then` method.

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

  // return the promise within a function is correct too!
  const makeCustomWait = () =>
    waitForElementToBeRemoved(() => document.querySelector('div.getOuttaHere'));
});
```

## Further Reading

- [Async Utilities](https://testing-library.com/docs/dom-testing-library/api-async)
