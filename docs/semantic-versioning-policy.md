# Semantic Versioning Policy

`eslint-plugin-testing-library` follows [Semantic Versioning](https://semver.org/). However, for [the same reason as ESLint itself](https://github.com/eslint/eslint#semantic-versioning-policy), it's not always clear when a minor or major version bump occurs. To help clarify this for everyone, we've defined the following Semantic Versioning Policy for this ESLint plugin:

- Patch release (intended to not break your lint build)
  - A bug fix in a rule that results in `eslint-plugin-testing-library` reporting fewer errors.
  - A bug fix to the core.
  - Re-releasing after a failed release (i.e., publishing a release that doesn't work for anyone).
  - A dependency gets updated
- Minor release (might break your lint build)
  - A bug fix in a rule that results in `eslint-plugin-testing-library` reporting more errors.
  - A new rule is created.
  - A new option to an existing rule that does not result in ESLint reporting more errors by default.
  - A new option to an existing rule that might result in ESLint reporting more errors by default.
  - A new addition to an existing rule to support a newly-added Testing Library feature that will result in `eslint-plugin-testing-library` reporting more errors by default.
  - An existing rule is deprecated.
  - New capabilities to the public API are added (new classes, new methods, new arguments to existing methods, etc.).
  - A new shareable configuration is created.
  - An existing shareable configuration is updated and will result in strictly fewer errors (e.g., rule removals).
  - Support for a Node major version is added.
- Major release (likely to break your lint build)
  - An existing shareable configuration is updated and may result in new errors (e.g., rule additions, most rule option updates).
  - Part of the public API is removed or changed in an incompatible way. The public API includes:
    - Rule schemas
    - Configuration schema
  - Support for a Node major version is dropped.

According to our policy, any minor update may report more errors than the previous release (ex: from a bug fix). As such, we recommend using the tilde (`~`) in `package.json` e.g. `"eslint-plugin-testing-library": "~4.3.0"` to guarantee the results of your builds.
