# Disallow importing from DOM Testing Library (`testing-library/no-dom-import`)

💼 This rule is enabled in the following configs: `angular`, `marko`, `react`, `vue`.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

Ensure that there are no direct imports from `@testing-library/dom` or
`dom-testing-library` when using some testing library framework
wrapper.

## Rule Details

Testing Library framework wrappers as React Testing Library already
re-exports everything from DOM Testing Library, so you always have to
import Testing Library utils from corresponding framework wrapper
module to:

- use proper extended version of some of those methods containing
  additional functionality related to specific framework (e.g.
  `fireEvent` util)
- avoid importing from extraneous dependencies (similar to
  `eslint-plugin-import`)

This rule aims to prevent users from import anything directly from
`@testing-library/dom`, which is useful for
new starters or when IDEs autoimport from wrong module.

Examples of **incorrect** code for this rule:

```js
import { fireEvent } from 'dom-testing-library';
```

```js
import { fireEvent } from '@testing-library/dom';
```

```js
import { render } from '@testing-library/react'; // Okay, no error
import { screen } from '@testing-library/dom'; // Error, unnecessary import from @testing-library/dom
```

```js
const { fireEvent } = require('dom-testing-library');
```

```js
const { fireEvent } = require('@testing-library/dom');
```

Examples of **correct** code for this rule:

```js
import { fireEvent } from 'react-testing-library';
```

```js
import { fireEvent } from '@testing-library/react';
```

```js
const { fireEvent } = require('react-testing-library');
```

```js
const { fireEvent } = require('@testing-library/react');
```

## Options

This rule has an option in case you want to tell the user which framework to use.

### Example

```js
module.exports = {
	rules: {
		'testing-library/no-dom-import': ['error', 'react'],
	},
};
```

With the configuration above, if the user imports from `@testing-library/dom` or `dom-testing-library` instead of the used framework, ESLint will tell the user to import from `@testing-library/react` or `react-testing-library`.

## Further Reading

- [Angular Testing Library API](https://testing-library.com/docs/angular-testing-library/api)
- [React Testing Library API](https://testing-library.com/docs/react-testing-library/api)
- [Vue Testing Library API](https://testing-library.com/docs/vue-testing-library/api)
- [Marko Testing Library API](https://testing-library.com/docs/marko-testing-library/api)
