# Contributing

Thanks for being willing to contribute!

Working on your first Pull Request? You can learn how from this free series
[How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

## Project setup

1. Fork this repository
2. Clone your forked repository
3. Run `npm install` to install corresponding dependencies
4. Create a branch for your PR named like `pr/your-branch-name` (you can do this through git CLI with `git checkout -b pr/your-branch-name`)

> Tip: Keep your `master` branch pointing at the original repository and make
> pull requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/testing-library/eslint-plugin-testing-library.git
> git fetch upstream
> git branch --set-upstream-to=upstream/master master
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `master`
> branch to use the upstream master branch whenever you run `git pull`. Then you
> can make all of your pull request branches based on this `master` branch.
> Whenever you want to update your version of `master`, do a regular `git pull`.

## Committing and Pushing changes

There are git hooks config with this project that are automatically installed
and set up when you install dependencies. This will be run on every commit:

- check all tests are passing, code validation is fine and format files automatically
- check commit message is following [Conventional Commit specification](https://www.conventionalcommits.org/en/v1.0.0/)

You can run `npm run test:update` which will update any snapshots that need updating.

## Rule naming conventions

Based on [ESLint's Rule Naming Conventions](https://eslint.org/docs/developer-guide/working-with-rules#rule-naming-conventions), this is the simple convention you must follow:

- If your rule is disallowing something, prefix it with `no-` such as `no-debug`
  for disallowing `debug()`.
- If your rule is suggesting to use a specific way for something that can be
  done in several ways, you could **optionally** prefix it with `prefer-` such as
  `prefer-screen-queries` for suggesting to use `screen.getByText()` from
  imported `screen` rather than`getByText()` from `render`'s result,
  even though both are technically fine.
- If your rule is enforcing the inclusion of something, use a short name without a special prefix such as `await-async-utils` for enforcing to await proper async utils.
- Use dashes between words.
- Try to keep the name simple.

## Adding new rules

In the [same way as ESLint](https://eslint.org/docs/developer-guide/working-with-rules),
each rule has three files named with its identifier (e.g. `no-debug`):

- in the `lib/rules` directory: a source file (e.g. `no-debug.js`)
- in the `tests/lib/rules` directory: a test file (e.g. `no-debug.js`)
- in the `docs/rules` directory: a Markdown documentation file (e.g. `no-debug.md`)

Additionally, you need to do couple of extra things:

- Import the new rule in `lib/index.js` and include it
  in `rules` constant (there is a test which will make sure you did
  this). Remember to include your rule under corresponding `config` if necessary
  (a snapshot test will check this too, but you can update it just running
  `npm run test:update`).
- Include your rule in "Supported Rules" table within `README.md`.
  Don't forget to include proper badges if needed.

## Modifying rules

Just couple of things you need to remember when editing already existing rules:

- If renaming a rule, make sure to update all points mentioned in
  "Adding new rules" section.
- Try to add tests to cover the changes introduced, no matter if that's
  a bug fix or a new feature.

## Help needed

Please checkout the [the open issues](https://github.com/testing-library/eslint-plugin-testing-library/issues)

Also, please watch the repo and respond to questions/bug reports/feature requests! Thanks!
