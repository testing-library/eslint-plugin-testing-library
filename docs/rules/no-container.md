# testing-library/no-container

📝 Disallow the use of `container` methods.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

<!-- end auto-generated rule header -->

By using `container` methods like `.querySelector` you may lose a lot of the confidence that the user can really interact with your UI. Also, the test becomes harder to read, and it will break more frequently.

This applies to Testing Library frameworks built on top of **DOM Testing Library**

## Rule Details

This rule aims to disallow the use of `container` methods in your tests.

Examples of **incorrect** code for this rule:

```js
const { container } = render(<Example />);
const button = container.querySelector('.btn-primary');
```

```js
const { container: alias } = render(<Example />);
const button = alias.querySelector('.btn-primary');
```

```js
const view = render(<Example />);
const button = view.container.getElementsByClassName('.btn-primary');
```

Examples of **correct** code for this rule:

```js
render(<Example />);
screen.getByRole('button', { name: /click me/i });
```

## Further Reading

- [about the `container` element](https://testing-library.com/docs/react-testing-library/api#container-1)
- [querying with `screen`](https://testing-library.com/docs/dom-testing-library/api-queries#screen)
