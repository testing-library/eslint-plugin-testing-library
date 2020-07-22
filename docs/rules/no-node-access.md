# Disallow direct Node access (no-node-access)

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
// If is not importing a testing-library package

document.getElementById('submit-btn').closest('button');
```

## Further Reading

### Properties / methods that return another Node

- [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document)
- [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element)
- [`Node`](https://developer.mozilla.org/en-US/docs/Web/API/Node)
