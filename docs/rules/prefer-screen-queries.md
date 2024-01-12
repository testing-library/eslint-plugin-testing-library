# Suggest using `screen` while querying (`testing-library/prefer-screen-queries`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

## Rule Details

DOM Testing Library (and other Testing Library frameworks built on top of it) exports a `screen` object which has every query (and a `debug` method). This works better with autocomplete and makes each test a little simpler to write and maintain.

This rule aims to force writing tests using built-in queries directly from `screen` object rather than destructuring them from `render` result. Given the screen component does not expose utility methods such as `rerender()` or the `container` property, it is correct to use the `render` returned value in those scenarios.

However, there are 3 exceptions when this rule won't suggest using `screen` for querying:

1. You are using a query chained to `within`
2. You are using custom queries, so you can't access them through `screen`
3. You are setting the `container` or `baseElement`, so you need to use the queries returned from `render`

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
import { render, screen } from '@testing-library/any-framework';

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

// the same functions, but called from destructuring
const { rerender, unmount, asFragment } = render(<Foo />);
rerender(<Foo />);
asFragment();
unmount();

// using baseElement
const { getByText } = render(<Foo />, { baseElement: treeA });
// using container
const { getAllByText } = render(<Foo />, { container: treeA });

// querying with a custom query imported from its own module
import { getByIcon } from 'custom-queries';
const element = getByIcon('search');

// querying with a custom query returned from `render`
const { getByIcon } = render(<Foo />);
const element = getByIcon('search');
```

## Further Reading

- [Common mistakes with React Testing Library - Not using `screen`](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#not-using-screen)
- [`screen` documentation](https://testing-library.com/docs/queries/about#screen)
- [Advanced - Custom Queries](https://testing-library.com/docs/dom-testing-library/api-custom-queries/)
- [React Testing Library - Add custom queries](https://testing-library.com/docs/react-testing-library/setup/#add-custom-queries)
