# Suggest using screen while using queries (prefer-screen-queries)

## Rule Details

DOM Testing Library (and other Testing Library frameworks built on top of it) exports a `screen` object which has every query (and a `debug` method). This works better with autocomplete and makes each test a little simpler to write and maintain.
This rule aims to force writing tests using queries directly from `screen` object rather than destructuring them from `render` result.

Examples of **incorrect** code for this rule:

```js
// calling a query from the `render` method
const { getByText } = render(<Component />);
getByText('foo');

const utils = render(<Component />);
utils.getByText('foo');
```

Examples of **correct** code for this rule:

```js
import { screen } from '@testing-library/any-framework';

render(<Component />);
screen.getByText('foo');
```

## Further Reading

- [`screen` documentation](https://testing-library.com/docs/dom-testing-library/api-queries#screen)
