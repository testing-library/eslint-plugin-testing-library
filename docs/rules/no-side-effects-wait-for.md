# Side effects inside `waitFor` are not preferred (no-side-effects-wait-for)

## Rule Details

This rule aims to avoid the usage of side effects actions (`fireEvent` or `useEvent`) inside `waitFor`.
Since `waitFor` is intended for things that have a non-deterministic amount of time between the action you performed and the assertion passing,
the callback can be called (or checked for errors) a non-deterministic number of times and frequency.
This will make your side-effect run multiple times.

Example of **incorrect** code for this rule:

```js
  await waitFor(() => {
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(b).toEqual('b');
  });

  // or
  await waitFor(function() {
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(b).toEqual('b');
  });

  // or
  await waitFor(() => {
    userEvent.keyDown(input, { key: 'ArrowDown' });
    expect(b).toEqual('b');
  });

  // or
  await waitFor(function() {
    userEvent.keyDown(input, { key: 'ArrowDown' });
    expect(b).toEqual('b');
  });
};
```

Examples of **correct** code for this rule:

```js
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  await waitFor(() => {
    expect(b).toEqual('b');
  });

  // or
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  await waitFor(function() {
    expect(b).toEqual('b');
  });

  // or
  userEvent.keyDown(input, { key: 'ArrowDown' });
  await waitFor(() => {
    expect(b).toEqual('b');
  });

  // or
  userEvent.keyDown(input, { key: 'ArrowDown' });
  await waitFor(function() {
    expect(b).toEqual('b');
  });
};
```

## Further Reading

- [about `waitFor`](https://testing-library.com/docs/dom-testing-library/api-async#waitfor)
- [about `userEvent`](https://github.com/testing-library/user-event)
- [about `fireEvent`](https://testing-library.com/docs/dom-testing-library/api-events)
- [inspiration for this rule](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#performing-side-effects-in-waitfor)
