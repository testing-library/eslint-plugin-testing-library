# Disallow direct Node access (no-node-access)

The Testing Library already provides methods for querying DOM elements.

## Rule Details

This rule aims to disallow DOM traversal using native HTML methods and properties, such as `closes`, `lastChild` and all that returns another Node element from an HTML tree.

Examples of **incorrect** code for this rule:

```js
screen.getByText('Submit').closest('button'); // chaining with Testing Library methods
```

```js
const buttons = screen.getAllByRole('button');
const buttonA = buttons[1]; // getting the element directly from the array

expect(buttonA.lastChild).toBeInTheDocument();
```

```js
const buttonText = screen.getByText('Submit');
const button = buttonText.closest('button');
```

```js
document.getElementById('submit-btn').closest('button');
```

Examples of **correct** code for this rule:

```js
const buttonText = screen.getByRole('button');
expect(buttonText.textContent).toBe('Submit');
```

## Further Reading

### Properties / methods that return another Node

- [`Document`](https://developer.mozilla.org/en-US/docs/Web/API/Document)
- [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element)
- [`Node`](https://developer.mozilla.org/en-US/docs/Web/API/Node)
