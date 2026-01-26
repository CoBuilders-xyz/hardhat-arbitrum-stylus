# Test Plugin

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page documents the hardhat-arb-test plugin.
THIS PLUGIN IS A PLACEHOLDER - NOT YET IMPLEMENTED.

WHAT TO WRITE:
- Clear "Coming Soon" indication
- Planned functionality description
- Expected features and usage
- Placeholder API documentation
- Current testing approaches

SECTIONS TO INCLUDE:

1. Status Banner
   - Clear "Coming Soon" notice

2. Planned Functionality
   - Test runner integration
   - Auto-start node for tests
   - Snapshot/revert support
   - Gas reporting

3. Expected Usage (Preview)
   - Anticipated commands
   - Anticipated configuration
   - Test file examples

4. Testing Today
   - Manual testing workflow
   - Using Hardhat's built-in testing
   - Node plugin for test environment

REFERENCE MATERIALS:
- packages/hardhat-arb-test/src/tasks/test.ts (placeholder)
- Hardhat testing documentation
- Mocha/Chai testing patterns

CURRENT IMPLEMENTATION (placeholder only):
```typescript
const taskTest: NewTaskActionFunction<{}> = async ({}, hre) => {
  console.log('test', 'hre.version:', hre.versions.hardhat);
};
```

=============================================================================
-->

**Package:** `@cobuilders/hardhat-arb-test`

**Status:** 🔜 Coming Soon

!!! warning "Coming Soon"
    This plugin is under active development. The API documented here represents planned functionality and may change.

## Planned Functionality

<!-- 
Describe what the plugin WILL do:
- Run tests against local Arbitrum node
- Auto-start node before tests
- Snapshot and revert for test isolation
- Gas usage reporting
- Integration with Hardhat test runner
-->

The Test plugin will provide:

- Integrated test runner for Stylus and Solidity
- Automatic node management during tests
- State snapshot and revert for test isolation
- Gas consumption reporting
- Coverage support

## Expected Usage

```bash
# Planned commands
npx hardhat arb:test
npx hardhat arb:test --grep "Counter"
npx hardhat arb:test test/counter.test.ts
```

### Expected Test Files

```typescript
// test/counter.test.ts (planned format)
import { expect } from 'chai';
import { loadFixture } from '@cobuilders/hardhat-arb-test';

describe('Counter', () => {
  async function deployFixture() {
    // Deploy contracts for testing
    const counter = await deploy('Counter');
    return { counter };
  }

  it('should increment', async () => {
    const { counter } = await loadFixture(deployFixture);
    
    await counter.increment();
    
    expect(await counter.get()).to.equal(1n);
  });
});
```

### Expected Configuration

```typescript
// Planned configuration structure
export default {
  arbTest: {
    // Auto-start node for tests
    autoStartNode: true,
    
    // Use Stylus-ready mode
    stylusReady: true,
    
    // Gas reporting
    gasReporter: {
      enabled: true,
    },
  },
};
```

## Testing Today

While this plugin is in development, you can test manually:

### Manual Testing Workflow

1. Start the node in one terminal:
   ```bash
   npx hardhat arb:node start --stylus-ready
   ```

2. Run tests in another terminal:
   ```bash
   npx hardhat test
   ```

### Example Test Setup

```typescript
// test/setup.ts
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const publicClient = createPublicClient({
  transport: http('http://localhost:8547'),
});

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),
  transport: http('http://localhost:8547'),
});
```

```typescript
// test/counter.test.ts
import { expect } from 'chai';
import { publicClient, walletClient } from './setup';

describe('Counter', () => {
  it('should work', async () => {
    // Your test logic
  });
});
```

## Roadmap

<!-- Link to GitHub issues or project board -->

Follow development progress:

- [GitHub Issues](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/issues)
