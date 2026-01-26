# Development

<!-- 
CONTENT DESCRIPTION:
How to contribute: setup, testing, workflow. Merged from contributing/* pages.
-->

Guide for contributors to the Hardhat Arbitrum Stylus project.

## Setup

### Prerequisites

- Node.js v22+
- pnpm v8+
- Docker (for integration tests)

### Clone and Install

```bash
git clone https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus.git
cd hardhat-arbitrum-stylus
pnpm install
pnpm build
```

## Development Workflow

### 1. Create Branch

```bash
git checkout main && git pull
git checkout -b feature/my-change
```

### 2. Make Changes

Edit code in `packages/*/src/`. Run continuously:

```bash
pnpm build
pnpm test
pnpm lint
```

### 3. Add Changeset

If your change affects published packages:

```bash
pnpm changeset
```

Select packages, choose bump type (patch/minor/major), write description.

**Skip changeset** for docs-only or test-only changes (add `no changeset needed` label to PR).

### 4. Submit PR

```bash
git add . && git commit -m "feat: description"
git push origin feature/my-change
```

Open PR to `main`. CI will run build, test, lint, and changeset check.

## Testing

### Run All Tests

```bash
pnpm test
```

### Run Single Package

```bash
cd packages/hardhat-arb-node
pnpm test
```

### Test Structure

```
packages/hardhat-arb-node/test/
├── fixture-projects/     # Test Hardhat projects
│   └── node-plugin/
│       └── hardhat.config.ts
├── start.ts              # Task tests
└── network-hook.ts       # Hook tests
```

### Using Fixture Projects

```typescript
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';

describe('MyPlugin', () => {
  useFixtureProject('node-plugin');

  it('should work', async () => {
    const hre = await import('hardhat');
    // Test with fixture project context
  });
});
```

### Integration Tests

Integration tests require Docker:

```bash
# Ensure Docker is running
docker info
pnpm test
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Check linting |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Check formatting |
| `pnpm format:fix` | Fix formatting |
| `pnpm clean` | Remove build artifacts |
| `pnpm changeset` | Create a changeset |

## PR Checklist

- [ ] Branch from `main`
- [ ] Tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Changeset created (if needed)
- [ ] PR targets `main`
