# Disallow the use of debugging utilities like `debug` (`testing-library/no-debug`)

Just like `console.log` statements pollutes the browser's output, debug statements also pollutes the tests if one of your teammates forgot to remove it. `debug` statements should be used when you actually want to debug your tests but should not be pushed to the codebase.

By default, this rule disallows the `debug` and `logTestingPlaygroundURL` utils.

## Rule Details

This rule aims to disallow the use of debugging utilities like `debug` in your tests.

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

If you want to allow the use of some debugging functions, you can configure what names this rule checks for with the `utilsToCheckFor` option:

```
   "testing-library/no-debug": ["error", { "utilsToCheckFor": { "debug": false } },
```

## Further Reading

- [debug API in React Testing Library](https://testing-library.com/docs/react-testing-library/api#debug)
- [`screen.debug` in Dom Testing Library](https://testing-library.com/docs/dom-testing-library/api-queries#screendebug)
