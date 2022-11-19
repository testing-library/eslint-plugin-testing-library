# Use `waitFor` instead of deprecated wait methods (`testing-library/prefer-wait-for`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

`dom-testing-library` v7 released a new async util called `waitFor` which satisfies the use cases of `wait`, `waitForElement`, and `waitForDomChange` making them deprecated.

## Rule Details

This rule aims to use `waitFor` async util rather than previous deprecated ones.

Deprecated `wait` async utils are:

- `wait`
- `waitForElement`
- `waitForDomChange`

> This rule will auto fix deprecated async utils for you, including the necessary empty callback for `waitFor`. This means `wait();` will be replaced with `waitFor(() => {});`

Examples of **incorrect** code for this rule:

```js
import { wait, waitForElement, waitForDomChange } from '@testing-library/dom';
// this also works for const { wait, waitForElement, waitForDomChange } = require ('@testing-library/dom')

const foo = async () => {
	await wait();
	await wait(() => {});
	await waitForElement(() => {});
	await waitForDomChange();
	await waitForDomChange(mutationObserverOptions);
	await waitForDomChange({ timeout: 100 });
};

import * as tl from '@testing-library/dom';
// this also works for const tl = require('@testing-library/dom')
const foo = async () => {
	await tl.wait();
	await tl.wait(() => {});
	await tl.waitForElement(() => {});
	await tl.waitForDomChange();
	await tl.waitForDomChange(mutationObserverOptions);
	await tl.waitForDomChange({ timeout: 100 });
};
```

Examples of **correct** code for this rule:

```js
import { waitFor, waitForElementToBeRemoved } from '@testing-library/dom';
// this also works for const { waitFor, waitForElementToBeRemoved } = require('@testing-library/dom')
const foo = async () => {
	// new waitFor method
	await waitFor(() => {});

	// previous waitForElementToBeRemoved is not deprecated
	await waitForElementToBeRemoved(() => {});
};

import * as tl from '@testing-library/dom';
// this also works for const tl = require('@testing-library/dom')
const foo = async () => {
	// new waitFor method
	await tl.waitFor(() => {});

	// previous waitForElementToBeRemoved is not deprecated
	await tl.waitForElementToBeRemoved(() => {});
};
```

## When Not To Use It

When using dom-testing-library (or any other Testing Library relying on dom-testing-library) prior to v7.

## Further Reading

- [dom-testing-library v7 release](https://github.com/testing-library/dom-testing-library/releases/tag/v7.0.0)
