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

| Option        | Details                                                                                                                                                                                                                                                      | Example                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| testIdPattern | A regex used to validate the format of the `data-testid` value. `{fileName}` can optionally be used as a placeholder and will be substituted with the name of the file OR the name of the files parent directory in the case when the fileName is `index.js` | `'^{fileName}(\_\_([A-Z]+[a-z]_?)+)_\$'` |

## Example

```json
{
  "testing-library/data-testid": [
    2,
    {
      "testIdPattern": "^TestId(__[A-Z]*)?$"
    }
  ]
}
```
