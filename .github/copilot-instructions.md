# ESLint Plugin Testing Library - Copilot Instructions

## Repository Overview

This is an ESLint plugin that enforces best practices for Testing Library (DOM, React, Vue, Angular, Svelte, Marko). The plugin provides 30 ESLint rules to catch common mistakes when writing tests with Testing Library frameworks.

**Language**: TypeScript
**Package Manager**: pnpm (version specified in `package.json` `packageManager` field)
**Node.js**: Version specified in `.nvmrc` (supported versions in `package.json` `engines.node`)
**Build Tool**: tsdown (TypeScript bundler using Rolldown)
**Test Framework**: Vitest
**Code Coverage**: 90% threshold (branches, functions, lines, statements)

## Prerequisites

**CRITICAL**: This project uses **pnpm**, not npm or yarn. Always use `pnpm` commands.

1. Enable pnpm via corepack: `corepack enable pnpm` (uses version from `package.json` `packageManager` field)
2. Node.js version is specified in `.nvmrc`
3. Install dependencies: `pnpm install` (this MUST be run first)

## Build and Validation Workflow

**ALWAYS run in this exact order when making changes:**

### 1. Install Dependencies (First Time Only)

```bash
pnpm install
```

This installs all dependencies and sets up git hooks via husky.

### 2. Development Workflow

```bash
# Lint your code (auto-fix available)
pnpm run lint          # Check for issues
pnpm run lint:fix      # Auto-fix issues

# Type check (no auto-fix)
pnpm run type-check

# Format code
pnpm run format        # Auto-format
pnpm run format:check  # Check formatting

# Run tests
pnpm run test          # Run all tests
pnpm run test:watch    # Watch mode
pnpm run test:ci       # With coverage (required for CI)
```

### 3. Build

```bash
pnpm run build
```

**Time**: ~2 seconds. Builds both ESM (`dist/index.mjs`) and CJS (`dist/index.cjs`) formats.
**Output**: `dist/` directory (gitignored)

### 4. Full Validation (Run Before Committing)

```bash
pnpm run validate-gen-all
```

**Time**: ~10 seconds. Validates that generated configs and docs are up to date.
This runs:

- `validate-gen:configs` - Checks configs are generated correctly
- `validate-gen:docs` - Checks documentation is up to date

### 5. Bundle Check

```bash
pnpm run bundle-check
```

**Time**: ~3 seconds. Validates package exports with publint.

## Testing

**Test Location**: `tests/` directory mirrors `src/` structure
**Test Files**: 34 test files with thousands of tests
**Test Time**: ~40 seconds for full suite

```bash
pnpm run test           # Run all tests once
pnpm run test:watch     # Watch mode for development
pnpm run test:ci        # CI mode with coverage and JUnit report
pnpm run test:ui        # Open Vitest UI
```

**Coverage thresholds** (90% required): branches, functions, lines, statements

## Project Structure

### Root Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode, ES2023 target)
- `eslint.config.js` - Flat ESLint config (ESLint v9)
- `vitest.config.ts` - Test configuration
- `prettier.config.js` - Prettier config (tabs, single quotes)
- `.nvmrc` - Node.js version (22)
- `pnpm-lock.yaml` - Lock file (DO NOT modify manually)

### Source Structure (`src/`)

- `rules/` - 30 ESLint rule implementations (TypeScript)
- `configs/` - 7 preset configurations (angular, dom, marko, react, svelte, vue, index)
- `create-testing-library-rule/` - Custom rule creator with helpers
- `utils/` - Shared utilities for detecting Testing Library patterns
- `node-utils/` - AST node utilities
- `index.ts` - Main plugin export

### Test Structure (`tests/`)

- `tests/rules/` - Rule tests (one file per rule)
- `tests/utils/` - Utility tests
- `tests/create-testing-library-rule.test.ts` - Rule creator tests
- `tests/fake-rule.ts` - Test fixture for rule creator

### Documentation (`docs/`)

- `docs/rules/` - Markdown documentation for each rule
- `docs/migration-guides/` - Version migration guides

## CI/CD Pipeline

### GitHub Actions Workflows

**Main CI** (`.github/workflows/ci.yml`):

- Runs on: pull requests, merge groups
- Calls: `verifications.yml` workflow

**Verifications** (`.github/workflows/verifications.yml`):

- **Code Validation Matrix**: lint, type-check, format:check, validate-gen-all, bundle-check
- **Test Matrix**: Node.js (18, 20, 21, 22, 23) × ESLint (8, 9) = 10 combinations
- **Timeout**: 3 minutes per test job
- **Coverage**: Uploads to Codecov with OIDC auth

**All validation steps run in parallel** to speed up CI.

## Git Hooks (via Husky)

### Pre-commit Hook

Runs `lint-staged` which:

1. Auto-formats all files with Prettier
2. Runs ESLint with `--fix` on changed `.js`, `.ts`, `.mjs`, `.mts` files

### Commit-msg Hook

Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

- Format: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, test, chore, etc.
- Example: `feat(no-await-sync-queries): add new rule`

**If commit fails**, fix the commit message format.

## Common Workflows

### Adding a New Rule

1. Create three files:
   - `src/rules/rule-name.ts` - Rule implementation
   - `tests/rules/rule-name.test.ts` - Tests
   - `docs/rules/rule-name.md` - Documentation

2. Use `createTestingLibraryRule` (NOT TSESLint's default creator):

   ```typescript
   import { createTestingLibraryRule } from '../create-testing-library-rule';

   export default createTestingLibraryRule({
   	name: 'rule-name',
   	meta: {
   		/* ... */
   	},
   	defaultOptions: [],
   	create(context, _, helpers) {
   		// Use helpers.isQuery(), helpers.isAsyncUtil(), etc.
   	},
   });
   ```

3. Register in `src/rules/index.ts`

4. Generate documentation: `pnpm run generate:docs`

5. Run tests: `pnpm run test`

### Updating Existing Rules

1. Modify rule implementation in `src/rules/`
2. Add tests to `tests/rules/`
3. Update documentation in `docs/rules/` if needed
4. Run `pnpm run validate-gen-all` to ensure docs are synced
5. Run `pnpm run test` to verify

### Before Committing

**ALWAYS run these commands**:

```bash
pnpm run lint:fix        # Fix linting issues
pnpm run type-check      # Verify types
pnpm run test            # Run tests
pnpm run validate-gen-all # Validate generated files
```

Git hooks will catch formatting issues, but manual validation is faster.

## Important Notes

### Package Manager

- **ONLY use pnpm**, never npm or yarn
- Commands: `pnpm install`, `pnpm run <script>`, `pnpm add <package>`

### Generated Files

**DO NOT manually edit** these files:

- `src/configs/*.ts` (except index.ts) - Auto-generated from `tools/generate-configs`
- Supported rules table in `README.md` - Auto-generated by `eslint-doc-generator`
- `dist/` directory - Build output

To update generated files:

```bash
pnpm run generate:configs  # Regenerate config files
pnpm run generate:docs     # Regenerate README table
```

### TypeScript

- **Strict mode enabled**: All type errors must be resolved
- **Target**: ES2023
- **Module**: preserve (implies Bundler resolution)
- **noEmit**: true (tsdown handles builds)

### Testing Best Practices

- Write realistic test scenarios with actual Testing Library imports
- Use `only: true` for focused testing during development (remove before committing)
- Check `line`, `column`, `messageId`, and `data` in invalid test cases
- Test with and without Shared Settings where applicable

### Build Artifacts to Ignore

The `.gitignore` already handles these, but be aware:

- `dist/` - Build output
- `coverage/` - Test coverage reports
- `test-report.junit.xml` - Test results
- `.eslintcache` - ESLint cache
- `node_modules/` - Dependencies

## Troubleshooting

### "pnpm: command not found"

Enable pnpm via corepack: `corepack enable pnpm`

### Build Failures

1. Clean and rebuild: `rm -rf dist && pnpm run build`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`

### Test Failures

- Run specific test: Add `only: true` to the test case
- Check coverage: `pnpm run test:ci`
- View in browser: `pnpm run test:ui`

### Validation Failures

If `validate-gen-all` fails:

1. Run `pnpm run generate:configs` to regenerate configs
2. Run `pnpm run generate:docs` to regenerate docs
3. Commit the changes

### Type Check Failures

- Use `pnpm run type-check` to see all errors
- Fix errors in source files (not `.d.ts` files)
- Strict mode is enabled; null checks are required

### Commit Message Rejected

Ensure format: `type(scope): description`
Valid types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert

## Key Commands Summary

| Command                     | Purpose                  | Time | Notes                         |
| --------------------------- | ------------------------ | ---- | ----------------------------- |
| `pnpm install`              | Install dependencies     | ~7s  | Run first, installs git hooks |
| `pnpm run build`            | Build plugin             | ~2s  | Outputs to `dist/`            |
| `pnpm run test`             | Run all tests            | ~40s | Thousands of tests            |
| `pnpm run test:ci`          | Tests + coverage         | ~45s | CI mode, 90% threshold        |
| `pnpm run lint`             | Check code style         | ~5s  | ESLint v9 flat config         |
| `pnpm run lint:fix`         | Fix code style           | ~5s  | Auto-fixes issues             |
| `pnpm run type-check`       | TypeScript check         | ~3s  | Strict mode                   |
| `pnpm run format:check`     | Check formatting         | ~2s  | Prettier with tabs            |
| `pnpm run format`           | Format code              | ~2s  | Auto-formats                  |
| `pnpm run validate-gen-all` | Validate generated files | ~10s | Configs + docs                |
| `pnpm run bundle-check`     | Validate package         | ~3s  | Uses publint                  |
| `pnpm run generate:configs` | Generate configs         | ~1s  | Run if configs change         |
| `pnpm run generate:docs`    | Generate docs            | ~5s  | Updates README table          |

## Trust These Instructions

These instructions have been tested and verified. Only search for additional information if:

1. These instructions are incomplete for your specific task
2. You encounter an error not covered here
3. You need details about a specific rule's implementation

For general development, **follow these instructions exactly** to avoid common pitfalls.
