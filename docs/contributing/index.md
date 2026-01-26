# Contributing

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page is the main contributing guide, based on existing CONTRIBUTING.md.

WHAT TO WRITE:
- Welcome contributors
- Branching model (trunk-based development)
- Creating features and fixes
- Changeset workflow
- Opening PRs
- How releases work
- Quick checklist

REFERENCE MATERIALS:
- Existing docs/CONTRIBUTING.md content (should be migrated here)
- Make this the canonical contributing guide

NOTE: This content should largely come from the existing CONTRIBUTING.md
but formatted for the documentation site with better navigation.

=============================================================================
-->

Thanks for contributing to Hardhat Arbitrum Stylus!

This repository uses **trunk-based development** and **Changesets** for versioning and releases.

## Branching Model

- **`main` is the integration branch**
- All work happens in **feature branches**
- Feature branches are merged **directly into `main`**
- Releases are handled automatically via CI

```
feature/*  ──►  main  ──►  Release PR  ──►  publish
```

Merging code into `main` **does NOT publish automatically**.

## Creating a Feature or Fix

1. Create a branch from `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b feature/my-change
   ```

2. Make your changes and commit as usual.

3. If you're adding new functionality, include tests. Existing tests must continue to pass.

## Changesets (Versioning)

If your change affects **published packages** (code changes, new features, fixes):

1. Run:

   ```bash
   pnpm changeset
   ```

2. Select the affected package(s)
3. Choose the version bump type (patch / minor / major)
4. Write a short description (this goes in the changelog)

This creates a file in `.changeset/`.
**Commit this file along with your code.**

### Rules

- ✅ **One changeset per PR** (not per commit)
- ❌ Do **not** run `changeset version`
- ❌ Do **not** manually bump versions in `package.json`

If your PR is **docs, tests, or internal refactoring only**, add the label:

```
no changeset needed
```

## Opening a PR

- Open a PR **to `main`**
- CI will check:
  - build succeeds
  - all tests pass
  - linting passes
  - a changeset exists (unless labeled otherwise)

### Merge Strategy

- PRs are **squash-merged**
- `main` maintains a linear history

## How Releases Work

Releases are fully automated via CI.

### After Your PR Merges to `main`

1. CI detects unreleased changesets

2. If changesets exist, CI opens or updates a **Release PR** containing:
   - version bumps
   - changelog updates
   - lockfile updates

3. When the **Release PR is merged**:
   - packages are published to npm
   - git tags are created

!!! note "Publishing"
    Only merging the Release PR triggers publishing.

## Quick Checklist

- [ ] Branch from `main`
- [ ] Tests pass locally (`pnpm test`)
- [ ] New functionality has tests
- [ ] Changeset created (if applicable)
- [ ] PR targets `main`

If you're unsure whether your change needs a changeset, **open the PR and ask** — we'll help.

## More Information

- [Development Setup](development-setup.md) — Set up your local environment
- [Testing](testing.md) — Running and writing tests
- [Versioning & Releases](versioning.md) — Detailed versioning strategy
