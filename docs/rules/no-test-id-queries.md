# Ensure no `data-testid` queries are used (`testing-library/no-test-id-queries`)

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to reduce the usage of `*ByTestId` queries in your tests.

When using `*ByTestId` queries, you are coupling your tests to the implementation details of your components, and not to how they behave and being used.

Prefer using queries that are more related to the user experience, like `getByRole`, `getByLabelText`, etc.

Example of **incorrect** code for this rule:

```js
const button = queryByTestId('my-button');
const input = screen.queryByTestId('my-input');
```

Examples of **correct** code for this rule:

```js
const button = screen.getByRole('button');
const input = screen.getByRole('textbox');
```

## Further Reading

- [about `getByTestId`](https://testing-library.com/docs/queries/bytestid)
- [about `getByRole`](https://testing-library.com/docs/queries/byrole)
- [about `getByLabelText`](https://testing-library.com/docs/queries/bylabeltext)
