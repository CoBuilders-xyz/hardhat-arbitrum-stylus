# Versioning & Releases

<!-- 
CONTENT DESCRIPTION:
How releases work. Changesets, automation, semver.
-->

How versioning and releases work in this project.

## Overview

- **Independent versioning** — Each package has its own version
- **Semantic versioning** — patch/minor/major per semver
- **Changesets** — Track changes, generate changelogs
- **Automated releases** — CI handles publishing

## Changesets

When you make changes that affect published packages:

```bash
pnpm changeset
```

This creates a file in `.changeset/`:

```markdown
---
'@cobuilders/hardhat-arb-node': minor
---

Added support for custom container names
```

**Rules:**

- ✅ One changeset per PR
- ❌ Don't run `changeset version`
- ❌ Don't manually edit `package.json` versions

## Release Flow

```
PR with changeset → Merge to main → Release PR created → Merge Release PR → Published to npm
```

1. **Merge PR to `main`** — CI detects changesets
2. **Release PR opens** — Contains version bumps and changelog updates
3. **Merge Release PR** — Packages published to npm, git tags created

!!! note
    Only merging the Release PR triggers publishing. Normal merges don't publish.

## Version Bumps

| Change | Bump |
|--------|------|
| Bug fix, backwards compatible | `patch` |
| New feature, backwards compatible | `minor` |
| Breaking change | `major` |

## Pre-releases

For testing before stable release:

```bash
# Enter pre-release mode
pnpm changeset pre enter alpha

# Create changesets and version
pnpm changeset
pnpm version-for-release

# Publish with tag
pnpm changeset publish --tag alpha

# Exit pre-release mode
pnpm changeset pre exit
```

## Changelog Tips

Write changesets for package consumers:

**Good:** `Fixed compilation failing when path contains spaces`

**Bad:** `Fixed bug`

For breaking changes, include migration:

```markdown
Changed config format from array to object.

**Migration:**
- Before: `stylus: ['--force']`
- After: `stylus: { args: ['--force'] }`
```
