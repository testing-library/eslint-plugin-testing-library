# Ensures consistent usage of `data-testid` (`testing-library/consistent-data-testid`)

<!-- end auto-generated rule header -->

Ensure `data-testid` values match a provided regex. This rule is un-opinionated, and requires configuration.

> ⚠️ This rule is only available in the following Testing Library packages:
>
> - `@testing-library/react` (supported by this plugin)

## Rule Details

> Assuming the rule has been configured with the following regex: `^TestId(\_\_[A-Z]*)?$`

Examples of **incorrect** code for this rule:

```js
const foo = (props) => <div data-testid="my-test-id">...</div>;
const foo = (props) => <div data-testid="myTestId">...</div>;
const foo = (props) => <div data-testid="TestIdEXAMPLE">...</div>;
```

Examples of **correct** code for this rule:

```js
const foo = (props) => <div data-testid="TestId__EXAMPLE">...</div>;
const bar = (props) => <div data-testid="TestId">...</div>;
const baz = (props) => <div>...</div>;
```

## Options

| Option            | Required | Default       | Details                                                                                                                                                                                                                                                                                                                                                                               | Example                                               |
| ----------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `testIdPattern`   | Yes      | None          | A regex used to validate the format of the `data-testid` value. `{fileName}` can optionally be used as a placeholder and will be substituted with the name of the file OR the name of the files parent directory in the case when the file name is `index.js` OR empty string in the case of dynamically changing routes (that contain square brackets) with `Gatsby.js` or `Next.js` | `^{fileName}(\_\_([A-Z]+[a-z]_?)+)_\$`                |
| `testIdAttribute` | No       | `data-testid` | A string (or array of strings) used to specify the attribute used for querying by ID. This is only required if data-testid has been explicitly overridden in the [RTL configuration](https://testing-library.com/docs/dom-testing-library/api-queries#overriding-data-testid)                                                                                                         | `data-my-test-attribute`, `["data-testid", "testId"]` |
| `customMessage`   | No       | `undefined`   | A string used to display a custom message whenever warnings/errors are reported.                                                                                                                                                                                                                                                                                                      | `A custom message`                                    |

## Example

```js
module.exports = {
	rules: {
		'testing-library/consistent-data-testid': [
			'error',
			{ testIdPattern: '^TestId(__[A-Z]*)?$' },
		],
	},
};
```

```js
module.exports = {
	rules: {
		'testing-library/consistent-data-testid': [
			'error',
			{ testIdAttribute: ['data-testid', 'testId'] },
		],
	},
};
```

```js
module.exports = {
	rules: {
		'testing-library/consistent-data-testid': [
			'error',
			{ customMessage: 'A custom message' },
		],
	},
};
```

## Notes

- If you are using Gatsby.js's [client-only routes](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/#syntax-client-only-routes) or Next.js's [dynamic routes](https://nextjs.org/docs/routing/dynamic-routes) and therefore have square brackets (`[]`) in the filename (e.g. `../path/to/[component].js`), the `{fileName}` placeholder will be replaced with an empty string. This is because a linter cannot know what the dynamic content will be at run time.
