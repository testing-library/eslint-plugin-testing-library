# Suggest using `userEvent` over `fireEvent` for simulating user interactions (`testing-library/prefer-user-event`)

<!-- end auto-generated rule header -->

From
[testing-library/dom-testing-library#107](https://github.com/testing-library/dom-testing-library/issues/107):

> [...] it is becoming apparent the need to express user actions on a web page
> using a higher-level abstraction than `fireEvent`

`userEvent` adds related event calls from browsers to make tests more realistic than its counterpart `fireEvent`, which is a low-level api.  
See the appendix at the end to check how are the events from `fireEvent` mapped to `userEvent`.

## Rule Details

This rule enforces the usage of [userEvent](https://github.com/testing-library/user-event) methods over `fireEvent`. By default, the methods from `userEvent` take precedence, but you add exceptions by configuring the rule in `.eslintrc`.

Examples of **incorrect** code for this rule:

```ts
// a method in fireEvent that has a userEvent equivalent
import { fireEvent } from '@testing-library/dom';
// or const { fireEvent } = require('@testing-library/dom');
fireEvent.click(node);

// using fireEvent with an alias
import { fireEvent as fireEventAliased } from '@testing-library/dom';
fireEventAliased.click(node);

// using fireEvent after importing the entire library
import * as dom from '@testing-library/dom';
// or const dom = require(@testing-library/dom');
dom.fireEvent.click(node);

// using fireEvent as a function
import * as dom from '@testing-library/dom';
dom.fireEvent(node, dom.createEvent('click', node));

import { fireEvent, createEvent } from '@testing-library/dom';
const clickEvent = createEvent.click(node);
fireEvent(node, clickEvent);
```

Examples of **correct** code for this rule:

```ts
import userEvent from '@testing-library/user-event';
// or const userEvent = require('@testing-library/user-event');

// any userEvent method
userEvent.click();

// fireEvent method that does not have an alternative in userEvent
import { fireEvent } from '@testing-library/dom';
// or const { fireEvent } = require('@testing-library/dom');
fireEvent.cut(node);

import * as dom from '@testing-library/dom';
// or const dom = require('@testing-library/dom');
dom.fireEvent.cut(node);

import { fireEvent, createEvent } from '@testing-library/dom';
fireEvent(node, createEvent('cut', node));
```

#### Options

This rule allows to exclude specific functions with an equivalent in `userEvent` through configuration. This is useful if you need to allow an event from `fireEvent` to be used in the solution. For specific scenarios, you might want to consider disabling the rule inline.

The configuration consists of an array of strings with the names of fireEvents methods to be excluded.  
An example looks like this

```js
module.exports = {
	rules: {
		rules: {
			'prefer-user-event': ['error', { allowedMethods: ['click', 'change'] }],
		},
	},
};
```

With this configuration example, the following use cases are considered valid

```ts
// using a named import
import { fireEvent } from '@testing-library/dom';
// or const { fireEvent } = require('@testing-library/dom');
fireEvent.click(node);
fireEvent.change(node, { target: { value: 'foo' } });

// using fireEvent with an alias
import { fireEvent as fireEventAliased } from '@testing-library/dom';
fireEventAliased.click(node);
fireEventAliased.change(node, { target: { value: 'foo' } });

// using fireEvent after importing the entire library
import * as dom from '@testing-library/dom';
// or const dom = require('@testing-library/dom');
dom.fireEvent.click(node);
dom.fireEvent.change(node, { target: { value: 'foo' } });
```

## When Not To Use It

When you don't want to use `userEvent`, such as if a legacy codebase is still using `fireEvent` or you need to have more low-level control over firing events (rather than the recommended approach of testing from a user's perspective)

## Further Reading

- [`user-event` repository](https://github.com/testing-library/user-event)
- [`userEvent` in the Testing Library docs](https://testing-library.com/docs/ecosystem-user-event)

## Appendix

The following table lists all the possible equivalents from the low-level API `fireEvent` to the higher abstraction API `userEvent`. All the events not listed here do not have an equivalent (yet)

| fireEvent method | Possible options in userEvent                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `click`          | <ul><li>`click`</li><li>`type`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>                  |
| `change`         | <ul><li>`upload`</li><li>`type`</li><li>`clear`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul> |
| `dblClick`       | <ul><li>`dblClick`</li></ul>                                                                                |
| `input`          | <ul><li>`type`</li><li>`upload`</li><li>`selectOptions`</li><li>`deselectOptions`</li><li>`paste`</li></ul> |
| `keyDown`        | <ul><li>`type`</li><li>`tab`</li></ul>                                                                      |
| `keyPress`       | <ul><li>`type`</li></ul>                                                                                    |
| `keyUp`          | <ul><li>`type`</li><li>`tab`</li></ul>                                                                      |
| `mouseDown`      | <ul><li>`click`</li><li>`dblClick`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>              |
| `mouseEnter`     | <ul><li>`hover`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>                                 |
| `mouseLeave`     | <ul><li>`unhover`</li></ul>                                                                                 |
| `mouseMove`      | <ul><li>`hover`</li><li>`unhover`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>               |
| `mouseOut`       | <ul><li>`unhover`</li></ul>                                                                                 |
| `mouseOver`      | <ul><li>`hover`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>                                 |
| `mouseUp`        | <ul><li>`click`</li><li>`dblClick`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>              |
| `paste`          | <ul><li>`paste`</li></ul>                                                                                   |
| `pointerDown`    | <ul><li>`click`</li><li>`dblClick`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>              |
| `pointerEnter`   | <ul><li>`hover`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>                                 |
| `pointerLeave`   | <ul><li>`unhover`</li></ul>                                                                                 |
| `pointerMove`    | <ul><li>`hover`</li><li>`unhover`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>               |
| `pointerOut`     | <ul><li>`unhover`</li></ul>                                                                                 |
| `pointerOver`    | <ul><li>`hover`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>                                 |
| `pointerUp`      | <ul><li>`click`</li><li>`dblClick`</li><li>`selectOptions`</li><li>`deselectOptions`</li></ul>              |
