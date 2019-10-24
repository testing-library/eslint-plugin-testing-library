# prefer toBeDisabled() or toBeEnabled() over toHaveProperty('disabled', true|false) (prefer-enabled-disabled)

## Rule Details

This rule aims to improve readability of tests.

Examples of **incorrect** code for this rule:

```js
expect(element).toHaveProperty('disabled', true);
expect(element).toHaveProperty('disabled', false);

expect(element).toHaveAttribute('disabled');
```

Examples of **correct** code for this rule:

```js
expect(element).toBeEnabled();

expect(element).toBeDisabled();

expect(element).toHaveProperty('checked', true);
```

### Options

N/A

## When Not To Use It

Don't use this rule if you:

- don't use jest-dom
- want to allow `.toHaveProperty('disabled', true|false);
