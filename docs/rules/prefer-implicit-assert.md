# Suggest using implicit assertions for getBy* & findBy* queries (`testing-library/prefer-implicit-assert`)

<!-- end auto-generated rule header -->

Testing Library `getBy*` & `findBy*` queries throw an error if the element is not
found. Therefore it is not necessary to also assert existence with things like `expect(getBy*.toBeInTheDocument()` or `expect(await findBy*).not.toBeNull()`

## Rule Details

This rule aims to reduce unnecessary assertion's for presence of an element,
when using queries that implicitly fail when said element is not found.

Examples of **incorrect** code for this rule with the default configuration:

```js
// wrapping the getBy or findBy queries within a `expect` and using existence matchers for
// making the assertion is not necessary
expect(getByText('foo')).toBeInTheDocument();
expect(await findByText('foo')).toBeInTheDocument();

expect(getByText('foo')).toBeDefined();
expect(await findByText('foo')).toBeDefined();

const utils = render(<Component />);
expect(utils.getByText('foo')).toBeInTheDocument();
expect(await utils.findByText('foo')).toBeInTheDocument();

expect(await findByText('foo')).not.toBeNull();
expect(await findByText('foo')).not.toBeUndefined();
```

Examples of **correct** code for this rule with the default configuration:

```js
getByText('foo');
await findByText('foo');

const utils = render(<Component />);
utils.getByText('foo');
await utils.findByText('foo');

// When using queryBy* queries these do not implicitly fail therefore you should explicitly check if your elements exist or not
expect(queryByText('foo')).toBeInTheDocument();
expect(queryByText('foo')).not.toBeInTheDocument();
```

## When Not To Use It

If you prefer to use `getBy*` & `findBy*` queries with explicitly asserting existence of elements, then this rule is not recommended. Instead check out this rule [prefer-explicit-assert](https://github.com/testing-library/eslint-plugin-testing-library/blob/main/docs/rules/prefer-explicit-assert.md)

- Never use both `prefer-implicit-assert` & `prefer-explicit-assert` choose one.
- This library recommends `prefer-explicit-assert` to make it more clear to readers that it is not just a query without an assertion, but that it is checking for existence of an element

## Further Reading

- [getBy query](https://testing-library.com/docs/dom-testing-library/api-queries#getby)
- [findBy query](https://testing-library.com/docs/dom-testing-library/api-queries#findBy)
