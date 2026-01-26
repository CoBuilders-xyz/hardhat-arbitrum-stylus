# Test Plugin

**Package:** `@cobuilders/hardhat-arb-test`

**Status:** 🔜 Coming Soon

!!! warning "Coming Soon"
    This plugin is under development.

## Planned Features

- Test runner integration
- Auto-start node for tests
- Snapshot/revert for test isolation

## Current Workaround

1. Start node in one terminal:
   ```bash
   npx hardhat arb:node start --stylus-ready
   ```

2. Run tests in another:
   ```bash
   npx hardhat test
   ```
