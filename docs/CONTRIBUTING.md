# Contributing

Thanks for contributing!
This repository uses **trunk-based development** and **Changesets** for versioning and releases.

---

## Branching model

- **`main` is the integration branch**
- All work happens in **feature branches**
- Feature branches are merged **directly into `main`**
- Releases are handled automatically via CI

```
feature/*  ──►  main  ──►  Release PR  ──►  publish
```

Merging code into `main` **does NOT publish automatically**.

---

## Creating a feature or fix

1. Create a branch from `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b feature/my-change
   ```

2. Make your changes and commit as usual.

3. If you're adding new functionality, include tests. Existing tests must continue to pass.

---

## Changesets (versioning)

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

---

## Opening a PR

- Open a PR **to `main`**
- CI will check:
  - build succeeds
  - all tests pass
  - linting passes
  - a changeset exists (unless labeled otherwise)

### Merge strategy

- PRs are **squash-merged**
- `main` maintains a linear history

---

## How releases work

Releases are fully automated via CI.

### After your PR merges to `main`

1. CI detects unreleased changesets

2. If changesets exist, CI opens or updates a **Release PR** containing:

   - version bumps
   - changelog updates
   - lockfile updates

3. When the **Release PR is merged**:
   - packages are published to npm
   - git tags are created

> **Only merging the Release PR triggers publishing.**

---

## Quick checklist

- [ ] Branch from `main`
- [ ] Tests pass locally (`pnpm test`)
- [ ] New functionality has tests
- [ ] Changeset created (if applicable)
- [ ] PR targets `main`

If you're unsure whether your change needs a changeset, **open the PR and ask** — we'll help.
