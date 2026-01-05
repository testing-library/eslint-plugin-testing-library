# testing-library/no-promise-in-fire-event

📝 Disallow the use of promises passed to a `fireEvent` method.

💼 This rule is enabled in the following configs: ![badge-angular](https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black) `angular`, ![badge-dom](https://img.shields.io/badge/%F0%9F%90%99-DOM-black?style=flat-square) `dom`, ![badge-marko](https://img.shields.io/badge/-Marko-black?style=flat-square&logo=marko&logoColor=white&labelColor=2596BE&color=black) `marko`, ![badge-react](https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black) `react`, ![badge-svelte](https://img.shields.io/badge/-Svelte-black?style=flat-square&logo=svelte&logoColor=white&labelColor=FF3E00&color=black) `svelte`, ![badge-vue](https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black) `vue`.

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
