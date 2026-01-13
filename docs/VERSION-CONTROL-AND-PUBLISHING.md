# Versioning and Publishing Strategy

This document describes how versioning, releases, and publishing work in the `hardhat-arbitrum-stylus` monorepo. For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Overview

The project uses:

- **pnpm workspaces** — monorepo management
- **Changesets** — version management and changelog generation
- **GitHub Actions** — automated CI/CD and npm publishing

All releases are automated. There is no manual publishing workflow for stable releases.

---

## Package Structure

```
hardhat-arbitrum-stylus/
├── packages/
│   ├── config/                      # Private — shared configuration
│   ├── hardhat-arb-compile/         # @cobuilders/hardhat-arb-compile
│   ├── hardhat-arb-deploy/          # @cobuilders/hardhat-arb-deploy
│   ├── hardhat-arb-node/            # @cobuilders/hardhat-arb-node
│   ├── hardhat-arb-test/            # @cobuilders/hardhat-arb-test
│   └── hardhat-arbitrum-stylus/     # @cobuilders/hardhat-arbitrum-stylus
```

The `config` package is private and never published. All other packages are public and versioned independently.

---

## Versioning Strategy

### Independent Versioning

Each package maintains its own version number. A change to `hardhat-arb-compile` does not force a version bump on `hardhat-arb-deploy`.

This approach:

- Avoids unnecessary version churn
- Lets consumers update only what they need
- Keeps changelogs focused and relevant

### Semantic Versioning

All packages follow semver:

| Bump      | When to use                        |
| --------- | ---------------------------------- |
| **patch** | Bug fixes, backwards compatible    |
| **minor** | New features, backwards compatible |
| **major** | Breaking changes                   |

---

## How Changesets Work

Changesets capture the _intent_ of a change at development time, rather than determining versions at release time.

### The Changeset File

When a developer runs `pnpm changeset`, a markdown file is created in `.changeset/`:

```markdown
---
'@cobuilders/hardhat-arb-compile': minor
---

Added support for Stylus SDK paths
```

This file declares:

- Which packages are affected
- What type of version bump each needs
- A human-readable description for the changelog

### Why This Approach

- **Decoupled from releases** — Changes accumulate until maintainers decide to release
- **Atomic** — Multiple packages can be released together with consistent versions
- **Traceable** — Each changelog entry links back to the work that produced it

---

## The Release Flow

Releases are fully automated via GitHub Actions. The flow has two distinct phases.

### Phase 1: Accumulating Changes

```
    Developer PR (with changeset)
         │
         ▼
      CI runs (build, test, lint, changeset check)
         │
         ▼
    Merge to main
         │
         ▼
  Release Action detects changesets
         │
         ▼
  Creates or updates Release PR
```

After each merge to `main`, the release workflow checks for pending changesets. If any exist, it opens (or updates) a **Release PR** that contains:

- Version bumps in `package.json` files
- Updated `CHANGELOG.md` files
- Updated lockfile

This PR stays open and accumulates changes as more work merges to `main`.

### Phase 2: Publishing

```
  Maintainer reviews Release PR
         │
         ▼
    Merge Release PR
         │
         ▼
  Release Action runs again
         │
         ▼
  No pending changesets detected
        AND
  Unpublished version bumps
         │
         ▼
  Publish to npm + create git tags
```

When the Release PR is merged:

1. The release workflow runs again
2. It finds no pending changesets (they were consumed to create the PR)
3. It publishes all packages with new versions to npm
4. It creates git tags for each published package

> Publishing **only** happens when the Release PR is merged. Regular merges to `main` never publish directly.

---

## Branch Protection

The `main` branch is protected:

- Pull request reviews required
- Status checks must pass (build, test, lint, changeset validation)
- Branches must be up to date before merging
- Linear history enforced (squash merges)

This ensures:

- All code in `main` has been reviewed
- All tests pass before code reaches `main`
- The Release PR reflects a tested, stable state

---

## CI Workflows

### CI Workflow (runs on every PR)

Validates that code is ready to merge:

- Builds all packages
- Runs all tests
- Runs linting
- Checks that a changeset exists (or PR has `no changeset needed` label)

### Release Workflow (runs on push to main)

Handles versioning and publishing:

1. Checks for pending changesets
2. If changesets exist → creates/updates Release PR
3. If no changesets AND unpublished version bumps → publishes packages to npm

The release workflow uses the official `changesets/action` which handles both modes automatically.

---

## Pre-release Versions

For testing changes before a stable release, pre-release versions can be published manually.

### Entering Pre-release Mode

```bash
pnpm changeset pre enter alpha
```

This puts changesets into pre-release mode. Subsequent version bumps produce versions like `0.1.0-alpha.0`, `0.1.0-alpha.1`, etc.

### Publishing a Pre-release

```bash
# Create changesets as normal
pnpm changeset

# Version packages (produces alpha versions)
pnpm version-for-release

# Publish with a dist-tag
pnpm changeset publish --tag alpha
```

The `--tag alpha` flag ensures users don't accidentally install the pre-release when running `npm install @cobuilders/hardhat-arb-compile`.

### Exiting Pre-release Mode

```bash
pnpm changeset pre exit
```

After exiting, the next version bump produces a stable release.

### When to Use Pre-releases

- Testing breaking changes with early adopters
- Validating fixes before a stable release
- Coordinating with dependent projects

---

## Changelog Generation

Changelogs are generated automatically from changeset descriptions. Each package maintains its own `CHANGELOG.md`.

### Writing Good Changeset Descriptions

Since these become changelog entries, write them for package consumers:

**Good:**

```
Fixed compilation failing when project path contains spaces
```

**Bad:**

```
Fixed bug
```

For breaking changes, include migration guidance:

```
---
'@cobuilders/hardhat-arb-compile': major
---

Changed configuration format from array to object.

**Migration:** Update your `hardhat.config.ts`:

Before:
stylus: ['--force'];


After:
stylus: {
  args: ['--force'];
}
```

---

## npm Organization

All packages are published under the `@cobuilders` scope on npm.

- Packages are public (`access: public`)
- Publishing is handled by GitHub Actions using an npm automation token
- The `NPM_TOKEN` secret is configured in the repository settings
