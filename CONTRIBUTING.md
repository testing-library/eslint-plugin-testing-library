# Contributing

Thanks for being willing to contribute!

Working on your first Pull Request? You can learn how from this free series
[How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

## Project setup

1. Fork this repository
2. Clone your forked repository
3. Run `npm install` to install corresponding dependencies
4. Create a branch for your PR named like `pr/your-branch-name` (you can do this through git CLI with `git checkout -b pr/your-branch-name`)

> Tip: Keep your `main` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/testing-library/eslint-plugin-testing-library.git
> git fetch upstream
> git branch --set-upstream-to=upstream/main main
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `main`
> branch to use the upstream main branch whenever you run `git pull`. Then you
> can make all of your pull request branches based on this `main` branch.
> Whenever you want to update your version of `main`, do a regular `git pull`.

## Committing and Pushing changes

Git hooks are configured on this project when you install dependencies.
The following will be run on every commit:

- Lint and format files automatically
- Check all tests are passing
- Check commit message is following [Conventional Commit specification](https://www.conventionalcommits.org/en/v1.0.0/)

If you ever need to update a snapshot, you can run `npm run test:update`

## Rule naming conventions

Based on [ESLint's Rule Naming Conventions](https://eslint.org/docs/developer-guide/working-with-rules#rule-naming-conventions), you must follow these rules:

- If your rule is disallowing something, prefix it with `no-` such as `no-debug`
  for disallowing `debug()`.
- If your rule is suggesting to prefer a way of doing something, among other ways, you can **optionally** prefix it with
  `prefer-`. For example, `prefer-screen-queries` suggests to use `screen.getByText()` from imported `screen` rather
  than `getByText()` from `render`'s result though both are technically fine.
- If your rule is enforcing the inclusion of something, use a short name without a special prefix. As an example,
  `await-async-utils` enforce to wait for proper async utils.
- Use dashes between words.
- Try to keep the name simple and clear.

## Adding new rules

In the [same way as ESLint](https://eslint.org/docs/developer-guide/working-with-rules),
each rule has three files named with its identifier (e.g. `no-debug`):

- in the `lib/rules` directory: a source file (e.g. `no-debug.ts`)
- in the `tests/lib/rules` directory: a test file (e.g. `no-debug.ts`)
- in the `docs/rules` directory: a Markdown documentation file (e.g. `no-debug.md`)

Additionally, you need to do a couple of extra things:

- Import the new rule in `lib/index.ts` and include it
  in `rules` constant (there is a test which will make sure you did
  this). Remember to include your rule under corresponding `config` if necessary
  (a snapshot test will check this too, but you can update it just running
  `npm run test:update`).
- Include your rule in the "Supported Rules" table within the [README.md](./README.md).
  Don't forget to include the proper badges if needed and to sort alphabetically the rules for readability.

### Custom rule creator

In v4 we introduced several improvements for both the final users as for contributors. Now there is a custom Rule Creator available called `createTestingLibraryRule` which should be the default Rule Creator used in this plugin. This Testing Library Rule Creator extends TSESLint Rule Creator to enhance rules automatically, so it prevents rules to be reported if nothing related to Testing Library found, and injects a 3rd parameter within `create` function: `helpers`.

This new `helpers` available in the `create` of the rule gives you access to a bunch of utils to detect things related to Testing Library. You can find all of them in `detect-testing-library-utils.ts` file, but these are some helpers available:

- `isTestingLibraryImported`
- `isGetQueryVariant`
- `isQueryQueryVariant`
- `isFindQueryVariant`
- `isSyncQuery`
- `isAsyncQuery`
- `isQuery`
- `isCustomQuery`
- `isAsyncUtil`
- `isFireEventUtil`
- `isUserEventUtil`
- `isFireEventMethod`
- `isUserEventMethod`
- `isRenderUtil`
- `isRenderVariableDeclarator`
- `isDebugUtil`
- `isPresenceAssert`
- `isAbsenceAssert`
- `isNodeComingFromTestingLibrary`

Our custom Rule Creator will also take care of common checks like making sure Testing Library is imported, or verify Shared Settings. You don't need to implement anything to check if there is some import related to Testing Library or anything similar in your rule anymore, just stick to the `helpers` received as a 3rd parameter in your `create` function.

If you need some check related to Testing Library which is not available in any existing helper, feel free to implement a new one. You need to make sure to:

- add corresponding type
- pass it through `helpers`
- write some generic test within `fake-rule.ts`, which is a dumb rule to be able to test all enhanced behavior from our custom Rule Creator.

## Updating existing rules

A couple of things you need to remember when editing already existing rules:

- If renaming a rule, make sure to update all points mentioned in the
  "[Adding new rules"](#adding-new-rules) section.
- Try to add tests to cover the changes introduced, no matter if that's
  a bug fix or a new feature.

## Writing Tests

When writing tests for a new or existing rule, please make sure to follow these guidelines:

### Write real-ish scenarios

Since the plugin will report differently depending on which Testing Library package is imported and what Shared Settings are enabled, writing more realistic scenarios is pretty important. Ideally, you should:

- wrap the code for your rule with a real test file structure, something like

  ```javascript
  import { render } from '@testing-library/react';

  test('should report invalid render usage', () => {
    // the following line is the actual code you needed to test your rule,
    // but everything else helps finding edge cases and makes it more robust.
    const wrapper = render(<Component />);
  });
  ```

- add some extra valid and invalid cases for checking what's the result when some Shared Settings are enabled (so things may or may not be reported depending on the settings), or something named in the same way as a Testing Library util is found, but it's not coming from any Testing Library package (so it shouldn't be reported).

### Check as much as you can from error reported on invalid test cases

Please make sure you check `line`, `column`, `messageId` and `data` (if some) in your invalid test cases to check errors are reported as expected.

## Help needed

Please check the [the open issues](https://github.com/testing-library/eslint-plugin-testing-library/issues)

Also, please watch the repo and respond to questions/bug reports/feature requests! Thanks!
