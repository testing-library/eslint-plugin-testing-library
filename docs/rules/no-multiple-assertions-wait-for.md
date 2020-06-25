# Multiple assertions inside `waitFor` are not preferred (no-multiple-assertions-wait-for)

## Rule Details

This rule aims to ensure the correct usage of `expect` inside `waitFor`, in the way that they're intended to be used.
When using multiples assertions inside `waitFor`, if one fails, you have to wait for timeout before see it failing.
Putting one assertion, you can both wait for the UI to settle to the state you want to assert on,
and also fail faster if one of the assertions do end up failing

Example of **incorrect** code for this rule:

```js
const foo = async () => {
  await waitFor(() => {
    expect(a).toEqual('a');
    expect(b).toEqual('b');
  });
};
```

Examples of **correct** code for this rule:

```js
const foo = async () => {
  await waitFor(() => expect(a).toEqual('a'));

  // this rule only looks for expect
  await waitFor(() => {
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(b).toEqual('b');
  });

  // or
  await waitFor(() => {
    console.log('testing-library');
    expect(b).toEqual('b');
  });
};
```

## Further Reading

- [about `waitFor`](https://testing-library.com/docs/dom-testing-library/api-async#waitfor)
