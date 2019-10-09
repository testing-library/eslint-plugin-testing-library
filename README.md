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

<hr>

[![Build status][build-badge]][https://travis-ci.org/belco90/eslint-plugin-testing-library]
[![Package version][version-badge]][https://www.npmjs.com/package/eslint-plugin-testing-library]
[![MIT License][license-badge]][https://github.com/belco90/eslint-plugin-testing-library/blob/master/license]
<br>
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![PRs Welcome][pr-badge]][http://makeapullrequest.com]
<br>
[![Watch on Github][gh-watchers-badge]][https://github.com/belco90/eslint-plugin-testing-library/watchers]
[![Star on Github][gh-watchers-badge]][https://github.com/belco90/eslint-plugin-testing-library/stargazers]
[![Tweet][tweet-badge]][https://twitter.com/intent/tweet?url=https%3a%2f%2fgithub.com%2fbelco90%2feslint-plugin-testing-library&text=check%20out%20eslint-plugin-testing-library%20by%20@belcodev]

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

| Rule                                                     | Description                                    | Configurations                                                            | Fixable            |
| -------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- | ------------------ |
| [await-async-query](docs/rules/await-async-query.md)     | Enforce async queries to have proper `await`   | ![recommended-badge][] ![angular-badge][] ![react-badge][] ![vue-badge][] |                    |
| [await-fire-event](docs/rules/await-fire-event.md)       | Enforce async fire event methods to be awaited | ![vue-badge][]                                                            |                    |
| [no-await-sync-query](docs/rules/no-await-sync-query.md) | Disallow unnecessary `await` for sync queries  | ![recommended-badge][] ![angular-badge][] ![react-badge][] ![vue-badge][] |                    |
| [no-debug](docs/rules/no-debug.md)                       | Disallow the use of `debug`                    | ![angular-badge][] ![react-badge][] ![vue-badge][]                        |                    |
| [no-dom-import](docs/rules/no-dom-import.md)             | Disallow importing from DOM Testing Library    | ![angular-badge][] ![react-badge][] ![vue-badge][]                        | ![fixable-badge][] |

[build-badge]: https://img.shields.io/travis/Belco90/eslint-plugin-testing-library?style=flat-square
[version-badge]: https://img.shields.io/npm/v/eslint-plugin-testing-library?style=flat-square
[license-badge]: https://img.shields.io/npm/l/eslint-plugin-testing-library?style=flat-square
[pr-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[gh-watchers-badge]: https://img.shields.io/github/watchers/Belco90/eslint-plugin-testing-library?style=social
[gh-stars-badge]: https://img.shields.io/github/stars/Belco90/eslint-plugin-testing-library?style=social
[tweet-badge]: https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2FBelco90%2Feslint-plugin-testing-library
[recommended-badge]: https://img.shields.io/badge/recommended-lightgrey?style=flat-square
[fixable-badge]: https://img.shields.io/badge/fixable-success?style=flat-square
[angular-badge]: https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black
[react-badge]: https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black
[vue-badge]: https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black
