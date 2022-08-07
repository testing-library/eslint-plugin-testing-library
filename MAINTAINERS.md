This document outlines some processes that the maintainers should stick to.

## Node.js version

We will try to stick to the same range of [Node.js versions supported by ESLint](https://github.com/eslint/eslint#installation-and-usage) as much as possible.

For local development and CI, we will use the Maintenance LTS version (specified in `.nvmrc` file).

## Issues Process

There are 3 types of issues that can be created:

- `"bug"`
- `"new rule"`
- `"enhancement"`

### Triage

The triage process is basically making sure that the issue is correctly reported (and ask for more info if not), and categorize it correctly if it belongs to a different type than initially assigned.

- When a new issue is created, they'll include a `"triage"` label
- If the issue is correctly reported, please remove the `"triage"` label, so we know is valid and ready to be tackled
- If the issue is **not** correctly reported, please ask for more details and add the `"awaiting response"` label, so we know more info has been requested to the author
- If the issue belong to an incorrect category, please update the labels to put it in the right category
- If the issue is duplicated, please close it including a comment with a link to the duplicating issue

## Pull Requests Process

### Main PR workflow

_TODO: pending to describe the main PR process_

### Contributors

When the PR gets merged, please check if the author of the PR or the closed issue (if any) should be added or updated in the [Contributors section](https://github.com/testing-library/eslint-plugin-testing-library#contributors-).

If so, you can ask the [`@all-contributors` bot to add a contributor](https://allcontributors.org/docs/en/bot/usage) in a comment of the merged PR (this works for both adding and updating). Remember to check the [Contribution Types table](https://allcontributors.org/docs/en/emoji-key) to decide which sort of contribution should be assigned.

## Stale bot

This repo uses [probot-stale](https://github.com/probot/stale) to close abandoned issues and PRs after a period of inactivity.

They'll be considered inactive if they match all the following conditions:

- they have been 60 days inactive
- they have at least one of the following labels:
  - `"awaiting response"`: we are waiting for more details but the author didn't react
  - `"new rule"`: there is a proposal for a new rule that no one could handle
  - `"enhancement"`: there is a proposal for an enhancement that no one could handle
  - `"invalid"`: something is wrong with the issue/PR and the author didn't take care of it

When flagged as a stale issue or PR, they'll be definitely closed after 7 more days of inactivity. Issues and PRs with the following labels are excluded: `"pinned"`, `"security"`, and "`triage"`. Use the first one if you need to exclude an issue or PR from being closed for whatever reason even if the inactive criteria is matched.
