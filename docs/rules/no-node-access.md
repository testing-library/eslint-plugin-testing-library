# Disallow direct Node access (`testing-library/no-node-access`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

The Testing Library already provides methods for querying DOM elements.

## Rule Details

This rule aims to disallow DOM traversal using native HTML methods and properties, such as `closest`, `lastChild` and all that returns another Node element from an HTML tree.

Examples of **incorrect** code for this rule:

```js
import { screen } from '@testing-library/react';

screen.getByText('Submit').closest('button'); // chaining with Testing Library methods
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
