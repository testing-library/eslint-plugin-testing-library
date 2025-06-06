# Disallow direct Node access (`testing-library/no-node-access`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `svelte`, `vue`.

<!-- end auto-generated rule header -->

Disallow direct access or manipulation of DOM nodes in favor of Testing Library's user-centric APIs.

## Rule Details

This rule aims to disallow direct access and manipulation of DOM nodes using native HTML properties and methods — including traversal (e.g. `closest`, `lastChild`) as well as direct actions (e.g. `click()`, `focus()`). Use Testing Library’s queries and userEvent APIs instead.

Examples of **incorrect** code for this rule:

```js
import { screen } from '@testing-library/react';

screen.getByText('Submit').closest('button'); // chaining with Testing Library methods
```

```js
import { screen } from '@testing-library/react';

screen.getByText('Submit').click();
```

```js
import { screen } from '@testing-library/react';

const buttons = screen.getAllByRole('button');
expect(buttons[1].lastChild).toBeInTheDocument();
```

```js
import { screen } from '@testing-library/react';

const buttonText = screen.getByText('Submit');
const button = buttonText.closest('button');
```

Examples of **correct** code for this rule:

```js
import { screen } from '@testing-library/react';

const button = screen.getByRole('button');
expect(button).toHaveTextContent('submit');
```

```js
import { screen } from '@testing-library/react';

userEvent.click(screen.getByText('Submit'));
```

```js
import { render, within } from '@testing-library/react';

const { getByLabelText } = render(<MyComponent />);
const signinModal = getByLabelText('Sign In');
within(signinModal).getByPlaceholderText('Username');
```

```js
import { screen } from '@testing-library/react';

function ComponentA(props) {
	// props.children is not reported
	return <div>{props.children}</div>;
}

render(<ComponentA />);
```

```js
// If is not importing a testing-library package

document.getElementById('submit-btn').closest('button');
```

## Options

This rule has one option:

- `allowContainerFirstChild`: **disabled by default**. When we have container
  with rendered content then the easiest way to access content itself is [by using
  `firstChild` property](https://testing-library.com/docs/react-testing-library/api/#container-1). Use this option in cases when this is hardly avoidable.

  ```js
  "testing-library/no-node-access": ["error", {"allowContainerFirstChild": true}]
  ```

Correct:

```jsx
const { container } = render(<MyComponent />);
expect(container.firstChild).toMatchSnapshot();
```

## Further Reading

### Properties / methods that return another Node

- [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document)
- [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element)
- [`Node`](https://developer.mozilla.org/en-US/docs/Web/API/Node)
