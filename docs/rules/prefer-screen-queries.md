# Suggest using screen while using queries (prefer-screen-queries)

## Rule Details

This works better with autocomplete and makes each test a little simpler.

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

screen.getByText('foo');
```

## Further Reading

- [`screen` documentation](https://testing-library.com/docs/dom-testing-library/api-queries#screen)
