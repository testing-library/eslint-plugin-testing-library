# Enforces consistent naming for the data-testid attribute (consistent-data-testid)

Ensure `data-testid` values match a provided regex. This rule is un-opinionated, and requires configuration.

## Rule Details

> Assuming the rule has been configured with the following regex: `^TestId(\_\_[A-Z]*)?$`

Examples of **incorrect** code for this rule:

```js
const foo = props => <div data-testid="my-test-id">...</div>;
const foo = props => <div data-testid="myTestId">...</div>;
const foo = props => <div data-testid="TestIdEXAMPLE">...</div>;
```

Examples of **correct** code for this rule:

```js
const foo = props => <div data-testid="TestId__EXAMPLE">...</div>;
const bar = props => <div data-testid="TestId">...</div>;
const baz = props => <div>...</div>;
```

## Options

| Option            | Required | Default       | Details                                                                                                                                                                                                                                                       | Example                                |
| ----------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `testIdPattern`   | Yes      | None          | A regex used to validate the format of the `data-testid` value. `{fileName}` can optionally be used as a placeholder and will be substituted with the name of the file OR the name of the files parent directory in the case when the file name is `index.js` | `^{fileName}(\_\_([A-Z]+[a-z]_?)+)_\$` |
| `testIdAttribute` | No       | `data-testid` | A string used to specify the attribute used for querying by ID. This is only required if data-testid has been explicitly overridden in the [RTL configuration](https://testing-library.com/docs/dom-testing-library/api-queries#overriding-data-testid)       | `data-my-test-attribute`               |

## Example

```json
{
  "testing-library/consistent-data-testid": [
    2,
    {
      "testIdPattern": "^TestId(__[A-Z]*)?$"
    }
  ]
}
```
