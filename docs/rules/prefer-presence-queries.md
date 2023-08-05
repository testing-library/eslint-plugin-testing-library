# Ensure appropriate `get*`/`query*` queries are used with their respective matchers (`testing-library/prefer-presence-queries`)

💼 This rule is enabled in the following configs: `angular`, `dom`, `marko`, `react`, `vue`.

<!-- end auto-generated rule header -->

The (DOM) Testing Library allows to query DOM elements using different types of queries such as `get*` and `query*`. Using `get*` throws an error in case the element is not found, while `query*` returns null instead of throwing (or empty array for `queryAllBy*` ones). These differences are useful in some situations:

- using `getBy*` queries when asserting if element is present, so if the element is not found the error thrown will offer better info than asserting with other queries which will not throw an error.
- using `queryBy*` queries when asserting if element is not present, so the test doesn't fail immediately when the element is not found and the assertion can be executed properly.

## Rule details

This rule fires whenever:

- `queryBy*` or `queryAllBy*` are used to assert element **is** present with `.toBeInTheDocument()`, `toBeTruthy()` or `.toBeDefined()` matchers or negated matchers from case below, or when used inside a `within()` clause.
- `getBy*` or `getAllBy*` are used to assert element **is not** present with `.toBeNull()` or `.toBeFalsy()` matchers or negated matchers from case above.

Examples of **incorrect** code for this rule:

```js
test('some test', () => {
	render(<App />);

	// check element is present with `queryBy*`
	expect(screen.queryByText('button')).toBeInTheDocument();
	expect(screen.queryAllByText('button')[0]).toBeTruthy();
	expect(screen.queryByText('button')).not.toBeNull();
	expect(screen.queryAllByText('button')[2]).not.toBeNull();
	expect(screen.queryByText('button')).not.toBeFalsy();
	...(within(screen.queryByText('button')))...

	// check element is NOT present with `getBy*`
	expect(screen.getByText('loading')).not.toBeInTheDocument();
	expect(screen.getAllByText('loading')[1]).not.toBeTruthy();
	expect(screen.getByText('loading')).toBeNull();
	expect(screen.getAllByText('loading')[3]).toBeNull();
	expect(screen.getByText('loading')).toBeFalsy();
});
```

Examples of **correct** code for this rule:

```js
test('some test', async () => {
	render(<App />);

	// check element is present with `getBy*`
	expect(screen.getByText('button')).toBeInTheDocument();
	expect(screen.getAllByText('button')[9]).toBeTruthy();
	expect(screen.getByText('button')).not.toBeNull();
	expect(screen.getAllByText('button')[7]).not.toBeNull();
	expect(screen.getByText('button')).not.toBeFalsy();
	...(within(screen.getByText('button')))...

	// check element is NOT present with `queryBy*`
	expect(screen.queryByText('loading')).not.toBeInTheDocument();
	expect(screen.queryAllByText('loading')[8]).not.toBeTruthy();
	expect(screen.queryByText('loading')).toBeNull();
	expect(screen.queryAllByText('loading')[6]).toBeNull();
	expect(screen.queryByText('loading')).toBeFalsy();

	// `findBy*` queries are out of the scope for this rule
	const button = await screen.findByText('submit');
	expect(button).toBeInTheDocument();
});
```

## Options

| Option     | Required | Default | Details                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `presence` | No       | `true`  | If enabled, this rule will ensure `getBy*` is used to validate whether an element is present. If disabled, `queryBy*` will be accepted for presence queries. _Note: using this option is not recommended. It is workaround for false positives that should eventually be [fixed](https://github.com/testing-library/eslint-plugin-testing-library/issues/518) in this repository._ |
| `absence`  | No       | `true`  | If enabled, this rule will ensure `queryBy*` is used to validate whether an element is absent. If disabled, `getBy*` will be accepted for absence queries. _Note: using this option is not recommended. It is workaround for false positives that should eventually be [fixed](https://github.com/testing-library/eslint-plugin-testing-library/issues/518) in this repository._   |

## Example

```js
module.exports = {
	rules: {
		'testing-library/prefer-presence-queries': [
			'error',
			{ absence: false, presence: true },
		],
	},
};
```

## Further Reading

- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
- [Asserting elements are not present](https://testing-library.com/docs/guide-disappearance#asserting-elements-are-not-present)
- [jest-dom note about using `getBy` within assertions](https://testing-library.com/docs/ecosystem-jest-dom)
- [Waiting for appearance](https://testing-library.com/docs/guide-disappearance#waiting-for-appearance)
