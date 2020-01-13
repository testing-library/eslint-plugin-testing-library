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

[![Build status][build-badge]][build-url]
[![Package version][version-badge]][version-url]
[![MIT License][license-badge]][license-url]
<br>
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![PRs Welcome][pr-badge]][pr-url]
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<br>
[![Watch on Github][gh-watchers-badge]][gh-watchers-url]
[![Star on Github][gh-stars-badge]][gh-stars-url]
[![Tweet][tweet-badge]][tweet-url]

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

| Rule                                                           | Description                                                         | Configurations                                                            | Fixable            |
| -------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------ |
| [await-async-query](docs/rules/await-async-query.md)           | Enforce async queries to have proper `await`                        | ![recommended-badge][] ![angular-badge][] ![react-badge][] ![vue-badge][] |                    |
| [await-fire-event](docs/rules/await-fire-event.md)             | Enforce async fire event methods to be awaited                      | ![vue-badge][]                                                            |                    |
| [no-await-sync-query](docs/rules/no-await-sync-query.md)       | Disallow unnecessary `await` for sync queries                       | ![recommended-badge][] ![angular-badge][] ![react-badge][] ![vue-badge][] |                    |
| [no-debug](docs/rules/no-debug.md)                             | Disallow the use of `debug`                                         | ![angular-badge][] ![react-badge][] ![vue-badge][]                        |                    |
| [no-dom-import](docs/rules/no-dom-import.md)                   | Disallow importing from DOM Testing Library                         | ![angular-badge][] ![react-badge][] ![vue-badge][]                        | ![fixable-badge][] |
| [prefer-expect-query-by](docs/rules/prefer-expect-query-by.md) | Disallow the use of `expect(getBy*)`                                | ![recommended-badge][] ![angular-badge][] ![react-badge][] ![vue-badge][] |                    |
| [prefer-explicit-assert](docs/rules/prefer-explicit-assert.md) | Suggest using explicit assertions rather than just `getBy*` queries |                                                                           |                    |
| [consistent-data-testid](docs/rules/consistent-data-testid.md) | Ensure `data-testid` values match a provided regex.                 |                                                                           |                    |

[build-badge]: https://img.shields.io/travis/Belco90/eslint-plugin-testing-library?style=flat-square
[build-url]: https://travis-ci.org/belco90/eslint-plugin-testing-library
[version-badge]: https://img.shields.io/npm/v/eslint-plugin-testing-library?style=flat-square
[version-url]: https://www.npmjs.com/package/eslint-plugin-testing-library
[license-badge]: https://img.shields.io/npm/l/eslint-plugin-testing-library?style=flat-square
[license-url]: https://github.com/belco90/eslint-plugin-testing-library/blob/master/license
[pr-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[pr-url]: http://makeapullrequest.com
[gh-watchers-badge]: https://img.shields.io/github/watchers/Belco90/eslint-plugin-testing-library?style=social
[gh-watchers-url]: https://github.com/belco90/eslint-plugin-testing-library/watchers
[gh-stars-badge]: https://img.shields.io/github/stars/Belco90/eslint-plugin-testing-library?style=social
[gh-stars-url]: https://github.com/belco90/eslint-plugin-testing-library/stargazers
[tweet-badge]: https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2FBelco90%2Feslint-plugin-testing-library
[tweet-url]: https://twitter.com/intent/tweet?url=https%3a%2f%2fgithub.com%2fbelco90%2feslint-plugin-testing-library&text=check%20out%20eslint-plugin-testing-library%20by%20@belcodev
[recommended-badge]: https://img.shields.io/badge/recommended-lightgrey?style=flat-square
[fixable-badge]: https://img.shields.io/badge/fixable-success?style=flat-square
[angular-badge]: https://img.shields.io/badge/-Angular-black?style=flat-square&logo=angular&logoColor=white&labelColor=DD0031&color=black
[react-badge]: https://img.shields.io/badge/-React-black?style=flat-square&logo=react&logoColor=white&labelColor=61DAFB&color=black
[vue-badge]: https://img.shields.io/badge/-Vue-black?style=flat-square&logo=vue.js&logoColor=white&labelColor=4FC08D&color=black

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://mario.dev"><img src="https://avatars1.githubusercontent.com/u/2677072?v=4" width="100px;" alt=""/><br /><sub><b>Mario Beltrán Alarcón</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=Belco90" title="Code">💻</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=Belco90" title="Documentation">📖</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/pulls?q=is%3Apr+reviewed-by%3ABelco90" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=Belco90" title="Tests">⚠️</a> <a href="#infra-Belco90" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="http://thomlom.dev"><img src="https://avatars3.githubusercontent.com/u/16003285?v=4" width="100px;" alt=""/><br /><sub><b>Thomas Lombart</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=thomlom" title="Code">💻</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=thomlom" title="Documentation">📖</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/pulls?q=is%3Apr+reviewed-by%3Athomlom" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=thomlom" title="Tests">⚠️</a> <a href="#infra-thomlom" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/benmonro"><img src="https://avatars3.githubusercontent.com/u/399236?v=4" width="100px;" alt=""/><br /><sub><b>Ben Monro</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=benmonro" title="Code">💻</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=benmonro" title="Documentation">📖</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=benmonro" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://emmenko.org/"><img src="https://avatars2.githubusercontent.com/u/1110551?v=4" width="100px;" alt=""/><br /><sub><b>Nicola Molinari</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=emmenko" title="Code">💻</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=emmenko" title="Tests">⚠️</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=emmenko" title="Documentation">📖</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/pulls?q=is%3Apr+reviewed-by%3Aemmenko" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://aarongarciah.com"><img src="https://avatars0.githubusercontent.com/u/7225802?v=4" width="100px;" alt=""/><br /><sub><b>Aarón García Hervás</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=aarongarciah" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.matej.snuderl.si/"><img src="https://avatars3.githubusercontent.com/u/8524109?v=4" width="100px;" alt=""/><br /><sub><b>Matej Šnuderl</b></sub></a><br /><a href="#ideas-Meemaw" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=Meemaw" title="Documentation">📖</a></td>
    <td align="center"><a href="https://afontcu.dev"><img src="https://avatars0.githubusercontent.com/u/9197791?v=4" width="100px;" alt=""/><br /><sub><b>Adrià Fontcuberta</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=afontcu" title="Code">💻</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=afontcu" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/jonaldinger"><img src="https://avatars1.githubusercontent.com/u/663362?v=4" width="100px;" alt=""/><br /><sub><b>Jon Aldinger</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=jonaldinger" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.thomasknickman.com"><img src="https://avatars1.githubusercontent.com/u/2933988?v=4" width="100px;" alt=""/><br /><sub><b>Thomas Knickman</b></sub></a><br /><a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=tknickman" title="Code">💻</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=tknickman" title="Documentation">📖</a> <a href="https://github.com/Belco90/eslint-plugin-testing-library/commits?author=tknickman" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
