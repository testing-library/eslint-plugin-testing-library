# Disallow the use of promises passed to a `fireEvent` method (`testing-library/no-promise-in-fire-event`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

Methods from `fireEvent` expect to receive a DOM element. Passing a promise will end up in an error, so it must be prevented.

Examples of **incorrect** code for this rule:

```js
import { screen, fireEvent } from '@testing-library/react';

// usage of unhandled findBy queries
fireEvent.click(screen.findByRole('button'));

// usage of unhandled promises
fireEvent.click(new Promise(jest.fn()));

// usage of references to unhandled promises
const promise = new Promise();
fireEvent.click(promise);

const anotherPromise = screen.findByRole('button');
fireEvent.click(anotherPromise);
```

Examples of **correct** code for this rule:

```js
import { screen, fireEvent } from '@testing-library/react';

// usage of getBy queries
fireEvent.click(screen.getByRole('button'));

// usage of awaited findBy queries
fireEvent.click(await screen.findByRole('button'));

// usage of references to handled promises
const promise = new Promise();
const element = await promise;
fireEvent.click(element);

const anotherPromise = screen.findByRole('button');
const button = await anotherPromise;
fireEvent.click(button);
```

## Further Reading

- [A Github Issue explaining the problem](https://github.com/testing-library/dom-testing-library/issues/609)
