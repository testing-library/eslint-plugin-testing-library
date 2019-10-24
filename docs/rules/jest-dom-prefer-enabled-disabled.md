# prefer toBeDisabled() or toBeEnabled() over toHaveProperty('disabled', true|false) (jest-dom-prefer-enabled-disabled)

## Rule Details

This rule aims to prevent false positives and improve readability and should only be used with the @testing-library/jest-dom package. See below for examples of those potential issues and why this rule is useful. The rule is autofixable and will replace any instances of `.toHaveProperty()` or `.toHaveAttribute()` with `.toBeEnabled()` or `toBeDisabled()` as appropriate.

### False positives

consider these 2 snippets:

```js

    const { getByRole } = render(<input type="checkbox" disabled>);
    const element = getByRole("checkbox");
    expect(element).toHaveProperty('disabled'); // passes


    const { getByRole } = render(<input type="checkbox" >);
    const element = getByRole("checkbox");
    expect(element).toHaveProperty('disabled'); // also passes 😱
```

### Readability

consider the following snippets.

```js
expect(element).not.toHaveAttribute('disabled', false); // confused yet?
```

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

- don't use jest-dom
- want to allow `.toHaveProperty('disabled', true|false);

## Further reading

- https://github.com/testing-library/jest-dom#tobedisabled
