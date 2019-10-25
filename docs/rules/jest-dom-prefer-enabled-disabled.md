# prefer toBeDisabled() or toBeEnabled() over toHaveProperty('disabled', true|false) (jest-dom-prefer-enabled-disabled)

## Rule Details

This rule aims to prevent false positives and improve readability and should only be used with the `@testing-library/jest-dom` package. See below for examples of those potential issues and why this rule is recommended. The rule is autofixable and will replace any instances of `.toHaveProperty()` or `.toHaveAttribute()` with `.toBeEnabled()` or `toBeDisabled()` as appropriate.

In addition, to avoid double negatives and confusing syntax, `expect(element).not.toBeDisabled()` is also reported and auto-fixed to `expect(element).toBeEnabled()` and vice versa.

### False positives

Consider these 2 snippets:

```js
const { getByRole } = render(<input type="checkbox" disabled />);
const element = getByRole('checkbox');
expect(element).toHaveProperty('disabled'); // passes

const { getByRole } = render(<input type="checkbox" />);
const element = getByRole('checkbox');
expect(element).toHaveProperty('disabled'); // also passes 😱
```

### Readability

Consider the following snippets:

```js
const { getByRole } = render(<input type="checkbox" />);
const element = getByRole('checkbox');

expect(element).toHaveAttribute('disabled', false); // fails
expect(element).toHaveAttribute('disabled', ''); // fails
expect(element).not.toHaveAttribute('disabled', ''); // passes

expect(element).not.toHaveAttribute('disabled', true); // passes.
expect(element).not.toHaveAttribute('disabled', false); // also passes.
```

As you can see, using `toHaveAttribute` in this case is confusing, unintuitive and can even lead to false positive tests.

Examples of **incorrect** code for this rule:

```js
expect(element).toHaveProperty('disabled', true);
expect(element).toHaveAttribute('disabled', false);

expect(element).toHaveAttribute('disabled');
expect(element).not.toHaveProperty('disabled');

expect(element).not.toBeDisabled();
expect(element).not.toBeEnabled();
```

Examples of **correct** code for this rule:

```js
expect(element).toBeEnabled();

expect(element).toBeDisabled();

expect(element).toHaveProperty('checked', true);

expect(element).toHaveAttribute('checked');
```

## When Not To Use It

Don't use this rule if you:

- don't use `jest-dom`
- want to allow `.toHaveProperty('disabled', true|false);`

## Further reading

- [toBeDisabled](https://github.com/testing-library/jest-dom#tobedisabled)
- [toBeEnabled](https://github.com/testing-library/jest-dom#tobeenabled)
