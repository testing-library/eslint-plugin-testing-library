# Suggest using userEvent with setup() instead of direct methods (`testing-library/prefer-user-event-setup`)

<!-- end auto-generated rule header -->

## Rule Details

This rule encourages using methods on instances returned by `userEvent.setup()` instead of calling methods directly on the `userEvent` object. The setup pattern is the [recommended approach](https://testing-library.com/docs/user-event/intro/#writing-tests-with-userevent) in the official user-event documentation.

Using `userEvent.setup()` provides several benefits:

- Ensures proper initialization of the user-event system
- Better reflects real user interactions with proper event sequencing
- Provides consistent timing behavior across different environments
- Allows configuration of delays and other options

### Why Use setup()?

Starting with user-event v14, the library recommends calling `userEvent.setup()` before rendering your component and using the returned instance for all user interactions. This ensures that the event system is properly initialized and that all events are fired in the correct order.

## Examples

Examples of **incorrect** code for this rule:

```js
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

test('clicking a button', async () => {
	render(<MyComponent />);
	// ❌ Direct call without setup()
	await userEvent.click(screen.getByRole('button'));
});

test('typing in input', async () => {
	render(<MyComponent />);
	// ❌ Direct call without setup()
	await userEvent.type(screen.getByRole('textbox'), 'Hello');
});

test('multiple interactions', async () => {
	render(<MyComponent />);
	// ❌ Multiple direct calls
	await userEvent.type(screen.getByRole('textbox'), 'Hello');
	await userEvent.click(screen.getByRole('button'));
});
```

Examples of **correct** code for this rule:

```js
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

test('clicking a button', async () => {
	// ✅ Create user instance with setup()
	const user = userEvent.setup();
	render(<MyComponent />);
	await user.click(screen.getByRole('button'));
});

test('typing in input', async () => {
	// ✅ Create user instance with setup()
	const user = userEvent.setup();
	render(<MyComponent />);
	await user.type(screen.getByRole('textbox'), 'Hello');
});

test('multiple interactions', async () => {
	// ✅ Use the same user instance for all interactions
	const user = userEvent.setup();
	render(<MyComponent />);
	await user.type(screen.getByRole('textbox'), 'Hello');
	await user.click(screen.getByRole('button'));
});

// ✅ Using a setup function pattern
function setup(jsx) {
	return {
		user: userEvent.setup(),
		...render(jsx),
	};
}

test('with custom setup function', async () => {
	const { user, getByRole } = setup(<MyComponent />);
	await user.click(getByRole('button'));
});
```

### Custom Render Functions

A common pattern is to create a custom render function that includes the user-event setup:

```js
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

function renderWithUser(ui, options) {
	return {
		user: userEvent.setup(),
		...render(ui, options),
	};
}

test('using custom render', async () => {
	const { user, getByRole } = renderWithUser(<MyComponent />);
	await user.click(getByRole('button'));
});
```

## When Not To Use This Rule

If you're using an older version of user-event (< v14) that doesn't support or require the setup pattern, you may want to disable this rule.

## Further Reading

- [user-event documentation - Writing tests with userEvent](https://testing-library.com/docs/user-event/intro/#writing-tests-with-userevent)
- [user-event setup() API](https://testing-library.com/docs/user-event/setup)
