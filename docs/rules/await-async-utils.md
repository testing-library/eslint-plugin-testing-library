# Enforce async utils to be awaited properly (await-async-utils)

Ensure that promises returned by async utils are handled properly.

## Rule Details

Testing library provides several utilities for dealing with asynchronous code. These are useful to wait for an element until certain criteria or situation happens. The available async utils are:

- `wait`
- `waitForElement`
- `waitForDomChange`
- `waitForElementToBeRemoved`

This rule aims to prevent users from forgetting to handle the returned promise from those async utils, which could lead to unexpected errors in the tests execution. The promises can be handled by using either `await` operator or `then` method.

Examples of **incorrect** code for this rule:

```js
test('something incorrectly', async () => {
  // ...
  wait(() => getByLabelText('email'));
  
  const [usernameElement, passwordElement] = waitForElement(
    () => [
      getByLabelText(container, 'username'),
      getByLabelText(container, 'password'),
    ],
    { container }
  );
  
  waitForDomChange(() => { return { container } });
  
  waitForElementToBeRemoved(() => document.querySelector('div.getOuttaHere'));
  // ...
});
```

Examples of **correct** code for this rule:

```js
test('something correctly', async () => {
  // ...
  await wait(() => getByLabelText('email'));
  
  const [usernameElement, passwordElement] = await waitForElement(
    () => [
      getByLabelText(container, 'username'),
      getByLabelText(container, 'password'),
    ],
    { container }
  );
  
  waitForDomChange(() => { return { container } })
    .then(() => console.log('DOM changed!'))
    .catch(err => console.log(`Error you need to deal with: ${err}`));
  
  waitForElementToBeRemoved(
    () => document.querySelector('div.getOuttaHere')
  ).then(() => console.log('Element no longer in DOM'));
  // ...
});
```

## Further Reading

- [Async Utilities](https://testing-library.com/docs/dom-testing-library/api-async)
