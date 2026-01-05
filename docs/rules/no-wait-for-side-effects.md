# testing-library/no-wait-for-side-effects

📝 Disallow the use of side effects in `waitFor`.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to avoid the usage of side effects actions (`fireEvent`, `userEvent` or `render`) inside `waitFor`.
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
    userEvent.click(button);
    expect(b).toEqual('b');
  });

  // or
  await waitFor(function() {
    userEvent.click(button);
    expect(b).toEqual('b');
  });

  // or
  await waitFor(() => {
    render(<App />)
    expect(b).toEqual('b');
  });

  // or
  await waitFor(function() {
    render(<App />)
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
  userEvent.click(button);
  await waitFor(() => {
    expect(b).toEqual('b');
  });

  // or
  userEvent.click(button);
  await waitFor(function() {
    expect(b).toEqual('b');
  });

  // or
  userEvent.click(button);
  waitFor(function() {
    expect(b).toEqual('b');
  }).then(() => {
    // Outside of waitFor, e.g. inside a .then() side effects are allowed
    fireEvent.click(button);
  });

  // or
  render(<App />)
  await waitFor(() => {
    expect(b).toEqual('b');
  });

  // or
  render(<App />)
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
