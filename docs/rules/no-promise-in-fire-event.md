# Disallow the use of promises passed to a `fireEvent` method (no-promise-in-fire-event)

The `fireEvent` method expects that a DOM element is passed.

Examples of **incorrect** code for this rule:

```js
import { screen, fireEvent } from '@testing-library/react';

// usage of findBy queries
fireEvent.click(screen.findByRole('button'));

// usage of promises
fireEvent.click(new Promise(jest.fn())
```

Examples of **correct** code for this rule:

```js
import { screen, fireEvent } from '@testing-library/react';

// use getBy queries
fireEvent.click(screen.getByRole('button'));

// use awaited findBy queries
fireEvent.click(await screen.findByRole('button'));
```

## Further Reading

- [A Github Issue explaining the problem](https://github.com/testing-library/dom-testing-library/issues/609)
