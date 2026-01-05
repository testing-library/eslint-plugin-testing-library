# testing-library/no-debugging-utils

📝 Disallow the use of debugging utilities like `debug`.

⚠️ This rule _warns_ in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

<!-- end auto-generated rule header -->

Just like `console.log` statements pollutes the browser's output, debug statements also pollutes the tests if one of your teammates forgot to remove it. `debug` statements should be used when you actually want to debug your tests but should not be pushed to the codebase.

## Rule Details

This rule supports disallowing the following debugging utilities:

- `debug`
- `logTestingPlaygroundURL`
- `prettyDOM`
- `logRoles`
- `logDOM`
- `prettyFormat`

By default, all are disallowed.

Examples of **incorrect** code for this rule:

```js
const { debug } = render(<Hello />);
debug();
```

```js
const utils = render(<Hello />);
utils.debug();
```

```js
import { screen } from '@testing-library/dom';
screen.debug();
```

```js
const { screen } = require('@testing-library/react');
screen.debug();
```

## Options

You can control which debugging utils are checked for with the `utilsToCheckFor` option:

```js
module.exports = {
	rules: {
		'testing-library/no-debugging-utils': [
			'error',
			{
				utilsToCheckFor: {
					debug: false,
					logRoles: true,
					logDOM: true,
				},
			},
		],
	},
};
```

## Further Reading

- [debug API in React Testing Library](https://testing-library.com/docs/react-testing-library/api#debug)
- [`screen.debug` in Dom Testing Library](https://testing-library.com/docs/dom-testing-library/api-queries#screendebug)
