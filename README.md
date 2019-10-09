<div align="center">
  <a href="https://eslint.org/">
    <img width="150" height="150" src="https://eslint.org/assets/img/logo.svg">
  </a>
  <a href="https://testing-library.com/">
    <img width="150" height="150" src="https://raw.githubusercontent.com/testing-library/dom-testing-library/master/other/octopus.png">
  </a>
  <h1>eslint-plugin-testing-library</h1>
  <p>ESLint plugin to follow best practices and anticipate common mistakes when writing tests with Testing Library</p>
</div>

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
    "testing-library/await-async-query": "error",
    "testing-library/no-await-sync-query": "error",
    "testing-library/no-debug": "warn"
  }
}
```

## Shareable configurations

### Recommended

This plugin exports a recommended configuration that enforces good
Testing Library practices _(you can find more info about enabled rules
in [Supported Rules section](#supported-rules) within Recommended
column)_.

To enable this configuration use the `extends` property in your
`.eslintrc` config file:

```json
{
  "extends": ["plugin:testing-library/recommended"]
}
```

### Frameworks

Starting from the premise that
[DOM Testing Library](https://testing-library.com/docs/dom-testing-library/intro)
is the base for the rest of Testing Library frameworks wrappers, this
plugin also exports different configuration for those frameworks that
enforces good practices for specific rules that only apply to them _(you
can find more info about enabled rules in
[Supported Rules section](#supported-rules) within Frameworks column)_.

**Note that frameworks configurations enable their specific rules +
recommended rules.**

Available frameworks configurations are:

#### Angular

To enable this configuration use the `extends` property in your
`.eslintrc` config file:

```json
{
  "extends": ["plugin:testing-library/angular"]
}
```

#### React

To enable this configuration use the `extends` property in your
`.eslintrc` config file:

```json
{
  "extends": ["plugin:testing-library/react"]
}
```

#### Vue

To enable this configuration use the `extends` property in your
`.eslintrc` config file:

```json
{
  "extends": ["plugin:testing-library/vue"]
}
```

## Supported Rules

| Rule                                                     | Description                                    | Configurations                                    | Fixable      |
| -------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- | ------------ |
| [await-async-query](docs/rules/await-async-query.md)     | Enforce async queries to have proper `await`   | ![recommended][] ![angular][] ![react][] ![vue][] |              |
| [await-fire-event](docs/rules/await-fire-event.md)       | Enforce async fire event methods to be awaited | ![vue][]                                          |              |
| [no-await-sync-query](docs/rules/no-await-sync-query.md) | Disallow unnecessary `await` for sync queries  | ![recommended][] ![angular][] ![react][] ![vue][] |              |
| [no-debug](docs/rules/no-debug.md)                       | Disallow the use of `debug`                    | ![angular][] ![react][] ![vue][]                  |              |
| [no-dom-import](docs/rules/no-dom-import.md)             | Disallow importing from DOM Testing Library    | ![angular][] ![react][] ![vue][]                  | ![fixable][] |

[recommended]: https://img.shields.io/badge/recommended-lightgrey?style=flat-square
[fixable]: https://img.shields.io/badge/fixable-success?style=flat-square
[angular]: https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black
[react]: https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black
[vue]: https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black
