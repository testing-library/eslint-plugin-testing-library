# testing-library/prefer-top-level-configure

📝 Disallow calling `configure` inside test functions to avoid cross-test side effects.

<!-- end auto-generated rule header -->

Calling `configure` from Testing Library inside a test body sets global options that persist for the rest of the test run. Because there is no automatic reset between tests, this creates implicit coupling between tests and makes test order matter.

The correct approach is to call `configure` at the top level of the module, or inside `beforeAll`/`beforeEach` hooks (paired with a corresponding reset in `afterEach`/`afterAll`).

## Rule Details

This rule warns when `configure` imported from a Testing Library package is called inside a `test`, `it`, `xit`, `xtest`, or any of their variants (`.each`, `.only`, `.skip`).

Examples of **incorrect** code for this rule:

```js
import { configure } from '@testing-library/react';

test('some test', () => {
	// FAIL: configure called inside test body
	configure({ reactStrictMode: true });

	// ...
});

it('another test', async () => {
	// FAIL: also invalid inside async tests
	configure({ asyncUtilTimeout: 5000 });

	// ...
});

test.each([1, 2])('parameterized %i', () => {
	// FAIL: also invalid inside test.each
	configure({ testIdAttribute: 'data-cy' });
});
```

Examples of **correct** code for this rule:

```js
import { configure } from '@testing-library/react';

// OK: top-level call
configure({ reactStrictMode: true });

test('some test', () => {
	// ...
});
```

```js
import { configure, cleanup } from '@testing-library/react';

let previousConfig;

beforeAll(() => {
	// OK: inside a setup hook
	previousConfig = configure({ asyncUtilTimeout: 5000 });
});

afterAll(() => {
	configure(previousConfig);
});

test('some test', () => {
	// ...
});
```

## Further Reading

- [configure API](https://testing-library.com/docs/dom-testing-library/api-configuration/)
