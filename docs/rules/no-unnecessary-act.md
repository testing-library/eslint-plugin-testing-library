# Disallow the use of `act` when wrapping Testing Library functions or functions with an empty body

## Rule Details

This rule disallows the usage of `act` when using it to wrap Testing Library functions, or functions with an empty body, which suppresses valid warnings. For more information, see [https://kcd.im/react-act](https://kcd.im/react-act).

Examples of **incorrect** code for this rule:

```js
import { fireEvent, act } from '@testing-library/react';

it('Should have foo', () => {
  act(() => fireEvent.click(el));
});
```

Examples of **correct** code for this rule:

```js
import { act } from '@testing-library/react';
it('Should have foo and bar', () => {
  act(() => {
    stuffThatDoesNotUseRTL();
  });
});
```