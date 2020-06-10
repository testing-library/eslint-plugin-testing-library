# Suggest using screen while using queries (prefer-screen-queries)

## Rule Details

DOM Testing Library (and other Testing Library frameworks built on top of it) exports a `screen` object which has every query (plus the `container` and a `debug` method). This works better with autocomplete and makes each test a little simpler to write and maintain.
This rule aims to force writing tests using queries directly from `screen` object rather than destructuring them from `render` result.

Examples of **incorrect** code for this rule:

```js
// calling a query from the `render` method
const { getByText, container } = render(<Component />);
getByText('foo');
container.querySelector('foo');

// calling a query from a variable returned from a `render` method
const utils = render(<Component />);
utils.getByText('foo');
utils.container.querySelector('foo');

// using after render
render(<Component />).getByText('foo');
render(<Component />).container.querySelector('foo');

// calling a query from a custom `render` method that returns an array
const [getByText, container] = myCustomRender(<Component />);
getByText('foo');
container.querySelector('foo');
```

Examples of **correct** code for this rule:

```js
import { screen } from '@testing-library/any-framework';

// calling a query from the `screen` object
render(<Component />);
screen.getByText('foo');
screen.container.querySelector('foo');

// using after within clause
within(screen.getByTestId('section')).getByText('foo');
within(screen.getByTestId('section')).container.querySelector('foo');

// calling a query method returned from a within call
const { getByText, container } = within(screen.getByText('foo'));
getByText('foo');
container.querySelector('foo');

// calling a method directly from a variable created by within
const myWithinVariable = within(screen.getByText('foo'));
myWithinVariable.getByText('foo');
myWithinVariable.container.querySelector('foo');
```

## Further Reading

- [`screen` documentation](https://testing-library.com/docs/dom-testing-library/api-queries#screen)
