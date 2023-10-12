# Suggest using explicit assertions rather than standalone queries (`testing-library/prefer-explicit-assert`)

<!-- end auto-generated rule header -->

Testing Library `getBy*` queries throw an error if the element is not
found. Some users like this behavior to use the query itself as an
assert for the element existence in their tests, but other users don't
and prefer to explicitly assert the element existence, so this rule is
for users from the latter.

## Rule Details

This rule aims to encourage users to explicitly assert existence of
elements in their tests rather than just use `getBy*` queries and expect
it doesn't throw an error so it's easier to understand what's the
expected behavior within the test.

Examples of **incorrect** code for this rule with the default configuration:

```js
// just calling `getBy*` query expecting not to throw an error as an
// assert-like method, without actually either using the returned element
// or explicitly asserting
getByText('foo');

const utils = render(<Component />);
utils.getByText('foo');

// This is an incorrect code when `includeFindQueries` is `true`, which is the
// default. Set it to `false` to shut off all warnings about find* queries.
await findByText('foo');
```

Examples of **correct** code for this rule with the default configuration:

```js
// wrapping the get query within a `expect` and use some matcher for
// making the assertion more explicit
expect(getByText('foo')).toBeDefined();

const utils = render(<Component />);
expect(utils.getByText('foo')).toBeDefined();

// even more explicit if you use `@testing-library/jest-dom` matcher
// for checking the element is present in the document
expect(queryByText('foo')).toBeInTheDocument();

// Doing something with the element returned without asserting is absolutely fine
await waitFor(() => getByText('foo'));
fireEvent.click(getByText('bar'));
const quxElement = getByText('qux');

expect(await findbyText('foo')).toBeTruthy();
const myButton = await screen.findByRole('button', { name: /Accept/ });
```

## Options

| Option               | Required | Default | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Example               |
| -------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `assertion`          | No       | None    | This string allows defining the preferred assertion to use with `getBy*` queries. By default, any assertion is valid (`toBeTruthy`, `toBeDefined`, etc.). However, they all assert slightly different things. This option ensures all `getBy*` assertions are consistent and use the same assertion. This rule only allows defining a presence matcher (`toBeInTheDocument`, `toBeTruthy`, or `toBeDefined`), but checks for both presence and absence matchers (`not.toBeFalsy` and `not.toBeNull`). This means other assertions such as `toHaveValue` or `toBeDisabled` will not trigger this rule since these are valid uses with `getBy*`. | `"toBeInTheDocument"` |
| `includeFindQueries` | No       | `true`  | This boolean controls whether queries such as `findByText` are also checked by this rule.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `false`               |

This is how you can use these options in eslint configuration:

```js
"testing-library/prefer-explicit-assert": [
  "error",
  { "assertion": "toBeInTheDocument", "includeFindQueries": false }
],
```

## When Not To Use It

If you prefer to use `getBy*` queries implicitly as an assert-like method itself, then this rule is not recommended. Instead check out this rule [prefer-implicit-assert](https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/prefer-implicit-assert.md)

- Never use both `prefer-explicit-assert` & `prefer-implicit-assert` choose one.
- This library recommends `prefer-explicit-assert` to make it more clear to readers that it is not just a query without an assertion, but that it is checking for existence of an element

## Further Reading

- [getBy query](https://testing-library.com/docs/dom-testing-library/api-queries#getby)
