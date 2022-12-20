# Enforce a valid naming for return value from `render` (`testing-library/render-result-naming-convention`)

💼 This rule is enabled in the following configs: `angular`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

> The name `wrapper` is old cruft from `enzyme` and we don't need that here. The return value from `render` is not "wrapping" anything. It's simply a collection of utilities that you should actually not often need anyway.

## Rule Details

This rule aims to ensure the return value from `render` is named properly.

Ideally, you should destructure the minimum utils that you need from `render`, combined with using queries from [`screen` object](https://github.com/testing-library/eslint-plugin-testing-library/blob/master/docs/rules/prefer-screen-queries.md). In case you need to save the collection of utils returned in a variable, its name should be either `view` or `utils`, as `render` is not wrapping anything: it's just returning a collection of utilities. Every other name for that variable will be considered invalid.

To sum up these rules, the allowed naming convention for return value from `render` is:

- destructuring
- `view`
- `utils`

Examples of **incorrect** code for this rule:

```javascript
import { render } from '@testing-library/framework';

// ...

// return value from `render` shouldn't be kept in a var called "wrapper"
const wrapper = render(<SomeComponent />);
```

```javascript
import { render } from '@testing-library/framework';

// ...

// return value from `render` shouldn't be kept in a var called "component"
const component = render(<SomeComponent />);
```

```javascript
import { render } from '@testing-library/framework';

// ...

// to sum up: return value from `render` shouldn't be kept in a var called other than "view" or "utils"
const somethingElse = render(<SomeComponent />);
```

Examples of **correct** code for this rule:

```javascript
import { render } from '@testing-library/framework';

// ...

// destructuring return value from `render` is correct
const { unmount, rerender } = render(<SomeComponent />);
```

```javascript
import { render } from '@testing-library/framework';

// ...

// keeping return value from `render` in a var called "view" is correct
const view = render(<SomeComponent />);
```

```javascript
import { render } from '@testing-library/framework';

// ...

// keeping return value from `render` in a var called "utils" is correct
const utils = render(<SomeComponent />);
```

## Further Reading

- [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#using-wrapper-as-the-variable-name-for-the-return-value-from-render)
- [`render` Result](https://testing-library.com/docs/react-testing-library/api#render-result)
