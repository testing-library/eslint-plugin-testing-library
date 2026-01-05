# testing-library/no-unnecessary-act

📝 Disallow wrapping Testing Library utils or empty callbacks in `act`.

💼 This rule is enabled in the following configs: ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`.

<!-- end auto-generated rule header -->

> ⚠️ The `act` method is only available on the following Testing Library packages:
>
> - `@testing-library/react` (supported by this plugin)
> - `@testing-library/preact` (not supported yet by this plugin)
> - `@testing-library/svelte` (not supported yet by this plugin)
> - `@marko/testing-library` (supported by this plugin)

## Rule Details

This rule aims to avoid the usage of `act` to wrap Testing Library utils just to silence "not wrapped in act(...)" warnings.

All Testing Library utils are already wrapped in `act`. Most of the time, if you're seeing an `act` warning, it's not just something to be silenced, but it's actually telling you that something unexpected is happening in your test.

Additionally, wrapping empty callbacks in `act` is also an incorrect way of silencing "not wrapped in act(...)" warnings.

Code violations reported by this rule will pinpoint those unnecessary `act`, helping to understand when `act` actually is necessary.

Example of **incorrect** code for this rule:

```js
// ❌ wrapping things related to Testing Library in `act` is incorrect
import {
	act,
	render,
	screen,
	waitFor,
	fireEvent,
} from '@testing-library/react';
// ^ act imported from 'react-dom/test-utils' will be reported too
import userEvent from '@testing-library/user-event';

// ...

act(() => {
	render(<Example />);
});

await act(async () => waitFor(() => {}));

act(() => screen.getByRole('button'));

act(() => {
	fireEvent.click(element);
});

act(() => {
	userEvent.click(element);
});
```

```js
// ❌ wrapping empty callbacks in `act` is incorrect
import { act } from '@testing-library/react';
// ^ act imported from 'react-dom/test-utils' will be reported too
import userEvent from '@testing-library/user-event';

// ...

act(() => {});

await act(async () => {});
```

Examples of **correct** code for this rule:

```js
// ✅ wrapping things not related to Testing Library in `act` is correct
import { act } from '@testing-library/react';
import { stuffThatDoesNotUseRTL } from 'somwhere-else';

// ...

act(() => {
	stuffThatDoesNotUseRTL();
});
```

```js
// ✅ wrapping both things related and not related to Testing Library in `act` is correct
import { act, screen } from '@testing-library/react';
import { stuffThatDoesNotUseRTL } from 'somwhere-else';

await act(async () => {
	await screen.findByRole('button');
	stuffThatDoesNotUseRTL();
});
```

## Options

This rule has one option:

- `isStrict`: **enabled by default**. Wrapping both things related and not related to Testing Library in `act` is reported

  ```js
  "testing-library/no-unnecessary-act": ["error", {"isStrict": true}]
  ```

Incorrect:

```jsx
// ❌ wrapping both things related and not related to Testing Library in `act` is NOT correct

import { act, screen } from '@testing-library/react';
import { stuffThatDoesNotUseRTL } from 'somwhere-else';

await act(async () => {
	await screen.findByRole('button');
	stuffThatDoesNotUseRTL();
});
```

## Further Reading

- [Inspiration for this rule](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#wrapping-things-in-act-unnecessarily)
- [Fix the "not wrapped in act(...)" warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning)
- [About React Testing Library `act`](https://testing-library.com/docs/react-testing-library/api/#act)
