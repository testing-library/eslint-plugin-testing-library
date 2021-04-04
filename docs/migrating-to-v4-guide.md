Previous versions of `eslint-plugin-testing-library` weren't checking common things consistently: Testing Library imports, renamed methods, wrappers around Testing Library methods, etc.
One of the most important changes of `eslint-plugin-testing-library` v4 is the new detection mechanism implemented to be shared across all the rules, so each one of them has been rewritten to detect and report Testing Library usages consistently and correctly from a core module.

## Overview

- Aggressive Reporting opted-in to avoid silencing possible errors
- 7 new rules
  - `no-container`
  - `no-node-access`
  - `no-promise-in-fire-event`
  - `no-wait-for-multiple-assertions`
  - `no-wait-for-side-effects`
  - `prefer-user-event`
  - `render-result-naming-convention`
- Config presets updated
  - `recommended` renamed to `dom`
  - `no-wait-for-empty-callback` and `prefer-screen-queries` enabled in presets
- Some rules option removed in favor of new Shared Settings + Aggressive Reporting
- More consistent and flexible core rules detection
- Tons of errors and small issues fixed
- Dependencies updates

## Breaking Changes

### Dependencies

- Min Node version required is `10.22.1`
- Min ESLint version required is `7.5`

Make sure you have Node and ESLint installed satisfying these new required versions.

### New errors reported

Since there are two new rules enabled in presets (`no-wait-for-empty-callback` and `prefer-screen-queries`), and v4 also fixes a lot of issues, you might find new errors reported in your codebase.
Just be aware of this when migrating to v4.

### `recommended` preset has been renamed

If you were using `recommended` preset, it has been renamed to `dom` so you'll need to update it in your ESLint config file:

```diff
{
  ...
- "extends": ["plugin:testing-library/recommended"]
+ "extends": ["plugin:testing-library/dom"]
}
```

This preset has been renamed to clarify there is no "recommended" preset by default, so it depends on which Testing Library package you are using: DOM, Angular, React, or Vue (for now).

### `customQueryNames` rules option has been removed

Until now, those rules reporting errors related to Testing Library queries needed an option called `customQueryNames` so you could specify which extra queries you'd like to report apart from built-in ones. This has been removed in favor of reporting every method matching Testing Library queries pattern. This means every method matching `get(All)By*`, `query(All)By*`, or `find(All)By*` will be reported, so for instance `getByText` and `getByIcon` will be assumed as queries to be reported. The only thing you need to do is removing `customQueryNames` from your rules config if any.

### `renderFunctions` rules option has been removed

TODO

## Aggressive Reporting

TODO

## Shared Settings

TODO
