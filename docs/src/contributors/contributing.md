# Contributing

Thanks for your interest in contributing! This guide walks you through the entire process.

---

## Step-by-Step Guide

### 1. Setup Your Environment

Clone the repository and install dependencies:

```bash
git clone https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus.git
cd hardhat-arbitrum-stylus
pnpm install
pnpm build
```

### 2. Create a Branch

Always branch from an up-to-date `main`:

```bash
git checkout main
git pull
git checkout -b feature/my-change   # or fix/my-fix
```

### 3. Make Your Changes

Write your code, then verify everything works:

```bash
pnpm build      # Compile all packages
pnpm test       # Run test suite (requires Docker)
pnpm lint       # Check code style
pnpm format:fix # Fix format
```

Run the tests at the root level to guarantee everything works.
```bash
pnpm test
```

### 4. Create a Changeset

If your change affects any published package, you need a changeset. This tracks what changed and updates the changelog. You'll likely also want to select `hardhat-arbitrum-stylus` so that its dependency on your package gets bumped.

```bash
pnpm changeset
```

You'll be prompted to:

1. **Select packages** — Pick which package(s) your change affects
2. **Choose version bump** — `patch` (bug fix), `minor` (new feature), or `major` (breaking change)
3. **Write a summary** — This becomes the changelog entry

This creates a file in `.changeset/`. Commit it with your code.

!!! note "When do I need a changeset?"
    - ✅ Bug fixes, new features, breaking changes
    - ❌ Documentation only, test changes, CI/tooling updates

    For changes that don't need a changeset, add the label `no changeset needed` to your PR.

!!! warning "Don't do these"
    - Don't run `pnpm changeset version` — CI handles this
    - Don't manually edit version numbers in `package.json`

### 5. Open a Pull Request

1. Push your branch to GitHub
2. Open a PR targeting `main`
3. CI will automatically run: build, test, lint, changeset validation
4. PRs are squash-merged when approved

---

## How Releases Work

You don't publish packages manually. Here's how it works:

```
Your PR → main → Release PR (auto-created) → npm publish
```

1. **You merge your PR** — Your changes land in `main`
2. **CI creates a Release PR** — Collects all changesets, bumps versions, updates changelogs
3. **Maintainer merges Release PR** — Packages are published to npm

Only merging the Release PR triggers publishing. Your individual PRs don't publish anything.

---

## Checklist

Before opening your PR, make sure:

- Branched from latest `main`
- `pnpm build` passes
- `pnpm test` passes
- `pnpm lint` passes
- `pnpm format:fix` passes
- Changeset added (or labeled `no changeset needed`)
- PR targets `main`
