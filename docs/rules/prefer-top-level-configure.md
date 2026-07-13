# testing-library/prefer-top-level-configure

📝 Prefer calling Testing Library `configure` at the top level.

<!-- end auto-generated rule header -->

`configure` changes global Testing Library options for the module. Calling it
inside a test, hook, or helper can make later tests depend on execution order
and can leave the process with a configuration that was intended for only one
test. Configure Testing Library once in a setup module or at the top level of
the test module instead.

## Rule Details

Examples of **incorrect** code for this rule:

```js
import { configure } from '@testing-library/react';

test('renders in strict mode', () => {
	configure({ reactStrictMode: true });
	// ...
});
```

```js
import * as testingLibrary from '@testing-library/dom';

function setupTest() {
	testingLibrary.configure({ testIdAttribute: 'data-test-id' });
}
```

Examples of **correct** code for this rule:

```js
import { configure } from '@testing-library/react';

configure({ reactStrictMode: true });

test('renders in strict mode', () => {
	// ...
});
```

```js
// setup-tests.js
import { configure } from '@testing-library/dom';

configure({ testIdAttribute: 'data-test-id' });
```

The rule recognizes Testing Library imports, namespace imports, CommonJS
requires, aliases, and modules configured with the
`testing-library/utils-module` shared setting.

## Further Reading

- [DOM Testing Library configuration](https://testing-library.com/docs/dom-testing-library/api-configuration/)
- [React Testing Library `configure`](https://testing-library.com/docs/react-testing-library/api#configure)
