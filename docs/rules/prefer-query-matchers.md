# Ensure the configured `get*`/`query*` query is used with the corresponding matchers (`testing-library/prefer-query-matchers`)

<!-- end auto-generated rule header -->

The (DOM) Testing Library allows to query DOM elements using different types of queries such as `get*` and `query*`. Using `get*` throws an error in case the element is not found, while `query*` returns null instead of throwing (or empty array for `queryAllBy*` ones).

It may be helpful to ensure that either `get*` or `query*` are always used for a given matcher. For example, `.toBeVisible()` and the negation `.not.toBeVisible()` both assume that an element exists in the DOM and will error if not. Using `get*` with `.toBeVisible()` ensures that if the element is not found the error thrown will offer better info than with `query*`.

## Rule details

This rule must be configured with a list of `validEntries`: for a given matcher, is `get*` or `query*` required.

Assuming the following configuration:

```json
{
	"testing-library/prefer-query-matchers": [
		2,
		{
			"validEntries": [{ "matcher": "toBeVisible", "query": "get" }]
		}
	]
}
```

Examples of **incorrect** code for this rule with the above configuration:

```js
test('some test', () => {
	render(<App />);

	// use configured matcher with the disallowed `query*`
	expect(screen.queryByText('button')).toBeVisible();
	expect(screen.queryByText('button')).not.toBeVisible();
	expect(screen.queryAllByText('button')[0]).toBeVisible();
	expect(screen.queryAllByText('button')[0]).not.toBeVisible();
});
```

Examples of **correct** code for this rule:

```js
test('some test', async () => {
	render(<App />);
	// use configured matcher with the allowed `get*`
	expect(screen.getByText('button')).toBeVisible();
	expect(screen.getByText('button')).not.toBeVisible();
	expect(screen.getAllByText('button')[0]).toBeVisible();
	expect(screen.getAllByText('button')[0]).not.toBeVisible();

	// use an unconfigured matcher with either `get* or `query*
	expect(screen.getByText('button')).toBeEnabled();
	expect(screen.getAllByText('checkbox')[0]).not.toBeChecked();
	expect(screen.queryByText('button')).toHaveFocus();
	expect(screen.queryAllByText('button')[0]).not.toMatchMyCustomMatcher();

	// `findBy*` queries are out of the scope for this rule
	const button = await screen.findByText('submit');
	expect(button).toBeVisible();
});
```

## Options

| Option         | Required | Default | Details                                                                                                                                                                                                            |
| -------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `validEntries` | No       | `[]`    | A list of objects with a `matcher` property (the name of any matcher, such as "toBeVisible") and a `query` property (either "get" or "query"). Indicates whether `get*` or `query*` are allowed with this matcher. |

## Example

```json
{
	"testing-library/prefer-query-matchers": [
		2,
		{
			"validEntries": [{ "matcher": "toBeVisible", "query": "get" }]
		}
	]
}
```

## Further Reading

- [Testing Library queries cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet#queries)
- [jest-dom note about using `getBy` within assertions](https://testing-library.com/docs/ecosystem-jest-dom)
