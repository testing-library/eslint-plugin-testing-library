# Disallow the use of the global RegExp flag (/g) in queries (`testing-library/no-global-regexp-flag-in-query`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Ensure that there are no global RegExp flags used when using queries.

## Rule Details

A RegExp instance that's using the global flag `/g` holds state and this might cause false-positives while querying for elements.

Examples of **incorrect** code for this rule:

```js
screen.getByText(/hello/gi);
```

```js
await screen.findByRole('button', { otherProp: true, name: /hello/g });
```

Examples of **correct** code for this rule:

```js
screen.getByText(/hello/i);
```

```js
await screen.findByRole('button', { otherProp: true, name: /hello/ });
```

## Further Reading

- [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex)
