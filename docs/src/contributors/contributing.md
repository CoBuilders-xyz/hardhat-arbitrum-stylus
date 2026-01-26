# Contributing

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

How to contribute: branching, changesets, PRs, releases.
Based on existing CONTRIBUTING.md style.

WHAT TO WRITE:
- Branching model (trunk-based)
- Creating features/fixes
- Changesets workflow
- Opening PRs
- How releases work
- Development setup
- Running tests
- Quick checklist

REFERENCE MATERIALS:
- docs/CONTRIBUTING.md (existing content)
- Changesets documentation

=============================================================================
-->

Thanks for contributing!

This repository uses **trunk-based development** and **Changesets** for versioning.

## Branching Model

```
feature/*  ──►  main  ──►  Release PR  ──►  publish
```

- `main` is the integration branch
- Feature branches merge directly to `main`
- Releases are automated via CI

## Development Setup

```bash
git clone https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus.git
cd hardhat-arbitrum-stylus
pnpm install
pnpm build
```

**Requirements:** Node.js v22+, pnpm v8+, Docker (for tests)

## Creating a Feature or Fix

```bash
git checkout main && git pull
git checkout -b feature/my-change
# Make changes
pnpm build && pnpm test && pnpm lint
```

## Changesets

If your change affects published packages:

```bash
pnpm changeset
```

1. Select affected package(s)
2. Choose bump type (patch/minor/major)
3. Write description (goes in changelog)
4. Commit the `.changeset/` file with your code

**Rules:**

- ✅ One changeset per PR
- ❌ Don't run `changeset version`
- ❌ Don't manually edit `package.json` versions

For docs/tests only, add label: `no changeset needed`

## Opening a PR

- Target `main`
- CI checks: build, test, lint, changeset
- PRs are squash-merged

## How Releases Work

1. Merge PR to `main` → CI detects changesets
2. CI opens/updates **Release PR** with version bumps
3. Merge Release PR → packages published to npm

Only merging the Release PR triggers publishing.

## Running Tests

```bash
pnpm test              # All tests
cd packages/hardhat-arb-node
pnpm test              # Single package
```

## Quick Checklist

- [ ] Branch from `main`
- [ ] Tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Changeset created (if needed)
- [ ] PR targets `main`
