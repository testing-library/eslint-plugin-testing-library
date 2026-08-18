# testing-library/prefer-form-submission

📝 Suggest submitting forms with `requestSubmit` or a submit button.

<!-- end auto-generated rule header -->

Dispatching a `submit` event directly invokes the event listeners without running the browser's form submission algorithm or constraint validation. This can make an invalid form look successfully submitted in a test.

Use `form.requestSubmit()` when the form itself is the subject of the test. Interact with a submit button when the user-facing submission path is the subject of the test. These APIs still run within the DOM implementation provided by the test environment; they do not make jsdom equivalent to a full browser.

## Rule Details

Examples of **incorrect** code for this rule:

```js
import { fireEvent } from '@testing-library/react';

fireEvent.submit(form);
fireEvent(form, new SubmitEvent('submit'));
form.dispatchEvent(new Event('submit'));
```

Examples of **correct** code for this rule:

```js
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

form.requestSubmit();

const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: 'Submit' }));
```

Tests that deliberately exercise a low-level `submit` listener can disable the rule for that line. Include a reason so the exception stays narrower than the form-submission tests around it.

```js
// eslint-disable-next-line testing-library/prefer-form-submission -- verifies raw submit-listener behavior
form.dispatchEvent(new SubmitEvent('submit'));
```

## When Not To Use It

Do not use this rule for a test suite that primarily verifies low-level DOM event behavior rather than form submission.

## Further Reading

- [HTML Standard: `requestSubmit`](https://html.spec.whatwg.org/multipage/forms.html#dom-form-requestsubmit)
- [Testing Library: considerations for `fireEvent`](https://testing-library.com/docs/guide-events/)
