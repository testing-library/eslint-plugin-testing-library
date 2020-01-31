# Disallow the use of `debug` (no-debug)

Just like `console.log` statements pollutes the browser's output, debug statements also pollutes the tests if one of your team mates forgot to remove it. `debug` statements should be used when you actually want to debug your tests but should not be pushed to the codebase.

## Rule Details

This rule aims to disallow the use of `debug` in your tests.

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

If you use [custom render functions](https://testing-library.com/docs/example-react-redux) then you can set a config option in your `.eslintrc` to look for these.

```
   "testing-library/no-debug": ["error", {"renderFunctions":["renderWithRedux", "renderWithRouter"]}],
```

## Further Reading

- [debug API in React Testing Library](https://testing-library.com/docs/react-testing-library/api#debug)
- [`screen.debug` in Dom Testing Library](https://testing-library.com/docs/dom-testing-library/api-queries#screendebug)
