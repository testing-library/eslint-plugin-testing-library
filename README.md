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
    "plugins": [
        "testing-library"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "testing-library/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





