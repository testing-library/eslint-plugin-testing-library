# Suggest using screen while using queries (prefer-screen-queries)

## Rule Details

DOM Testing Library (and other Testing Library frameworks built on top of it) exports a `screen` object which has every query (and a `debug` method). This works better with autocomplete and makes each test a little simpler to write and maintain.  
This rule aims to force writing tests using queries directly from `screen` object rather than destructuring them from `render` result. Given the screen component does not expose utility methods such as `rerender()` or the `container` property, it is correct to use the `render` response in those scenarios.

Examples of **incorrect** code for this rule:

```js
// calling a query from the `render` method
const { getByText } = render(<Component />);
getByText('foo');

// calling a query from a variable returned from a `render` method
const utils = render(<Component />);
utils.getByText('foo');

// using after render
render(<Component />).getByText('foo');

// calling a query from a custom `render` method that returns an array
const [getByText] = myCustomRender(<Component />);
getByText('foo');
```

Examples of **correct** code for this rule:

```js
import { screen } from '@testing-library/any-framework';

// calling a query from the `screen` object
render(<Component />);
screen.getByText('foo');

// using after within clause
within(screen.getByTestId('section')).getByText('foo');

// calling a query method returned from a within call
const { getByText } = within(screen.getByText('foo'));
getByText('foo');

// calling a method directly from a variable created by within
const myWithinVariable = within(screen.getByText('foo'));
myWithinVariable.getByText('foo');

// accessing the container and the base element
const utils = render(baz);
utils.container.querySelector('foo');
utils.baseElement.querySelector('foo');

// calling the utilities function
const utils = render(<Foo />);
utils.rerender(<Foo />);
utils.unmount();
utils.asFragment();
```

## Further Reading

- [`screen` documentation](https://testing-library.com/docs/dom-testing-library/api-queries#screen)
