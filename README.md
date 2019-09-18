# eslint-plugin-testing-library

ESLint plugin for Testing Library

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-testing-library`:

```
$ npm install eslint-plugin-testing-library --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-testing-library` globally.

## Usage

Add `testing-library` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["testing-library"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "testing-library/await-async-query": "warn",
    "testing-library/no-await-sync-query": "error"
  }
}
```

## Shareable configurations

### Recommended

This plugin exports a recommended configuration that enforces good Testing Library practices.

To enable this configuration use the `extends` property in your `.eslintrc` config file:

```json
{
  "extends": ["plugin:testing-library/recommended"]
}
```

## Supported Rules

| Rule                                                     | Description                                   | Recommended      |
| -------------------------------------------------------- | --------------------------------------------- | ---------------- |
| [await-async-query](docs/rules/await-async-query.md)     | Enforce async queries to have proper `await`  | ![recommended][] |
| [no-await-sync-query](docs/rules/no-await-sync-query.md) | Disallow unnecessary `await` for sync queries | ![recommended][] |

[recommended]: https://img.shields.io/badge/recommended-lightgrey?style=flat-square
