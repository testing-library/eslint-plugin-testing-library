# Disallow the use of debugging utilities like `debug` (`testing-library/no-debugging-utils`)

💼 This rule is enabled in the following configs: `angular`, `marko`, `react`, `vue`.

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

By default, only `debug` and `logTestingPlaygroundURL` are disallowed.

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
