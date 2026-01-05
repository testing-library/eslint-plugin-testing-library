# testing-library/no-global-regexp-flag-in-query

📝 Disallow the use of the global RegExp flag (/g) in queries.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

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
