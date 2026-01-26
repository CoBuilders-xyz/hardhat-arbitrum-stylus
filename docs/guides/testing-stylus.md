# Testing Stylus Contracts

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This guide covers strategies for testing Stylus contracts.

WHAT TO WRITE:
- Testing approaches for Stylus contracts
- Unit testing in Rust
- Integration testing with TypeScript/JavaScript
- Test patterns and best practices
- Mock strategies
- Gas testing

SECTIONS TO INCLUDE:

1. Testing Levels
   - Unit tests (Rust)
   - Integration tests (TypeScript)
   - E2E tests

2. Rust Unit Testing
   - Testing contract logic in Rust
   - Mocking stylus-sdk
   - cargo test

3. Integration Testing
   - Setting up test environment
   - Deploying contracts for tests
   - Using viem/ethers for interaction
   - Assertions and expectations

4. Test Patterns
   - Setup and teardown
   - Fixtures
   - Isolated tests
   - Shared state considerations

5. Gas Testing
   - Measuring gas consumption
   - Comparing implementations

REFERENCE MATERIALS:
- Stylus SDK testing documentation
- Hardhat testing patterns
- Arbitrum gas model

=============================================================================
-->

This guide covers strategies and patterns for testing Stylus contracts.

## Testing Levels

<!-- 
Explain the testing pyramid:
- Unit tests: Fast, test logic in isolation
- Integration tests: Test contract interactions
- E2E tests: Full workflow tests
-->

| Level | Language | Purpose |
|-------|----------|---------|
| Unit | Rust | Test contract logic in isolation |
| Integration | TypeScript | Test contract interactions on-chain |
| E2E | TypeScript | Test full workflows |

## Rust Unit Testing

<!-- 
Testing contract logic without deploying:
- Mock the stylus-sdk
- Test pure business logic
- Fast feedback loop
-->

Test your contract logic in Rust before deploying:

```rust
// contracts/stylus/counter/src/lib.rs

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_counter_logic() {
        // Test your business logic
        // (Stylus SDK mocking may be required)
    }
}
```

Run Rust tests:

```bash
cd contracts/stylus/counter
cargo test
```

## Integration Testing

### Test Setup

<!-- 
Setting up TypeScript integration tests:
- Start node
- Deploy contracts
- Write tests
-->

Create a test setup file:

```typescript
// test/setup.ts
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const RPC_URL = 'http://localhost:8547';

export const publicClient = createPublicClient({
  transport: http(RPC_URL),
});

export const accounts = [
  privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),
  privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'),
];

export const walletClient = createWalletClient({
  account: accounts[0],
  transport: http(RPC_URL),
});
```

### Writing Tests

```typescript
// test/counter.test.ts
import { expect } from 'chai';
import { publicClient, walletClient } from './setup';

describe('Counter', () => {
  let counterAddress: `0x${string}`;

  before(async () => {
    // Deploy contract (placeholder - use actual deployment)
    // counterAddress = await deployCounter();
  });

  describe('increment', () => {
    it('should increment the counter', async () => {
      // Get initial value
      const initialValue = await publicClient.readContract({
        address: counterAddress,
        abi: counterAbi,
        functionName: 'get',
      });

      // Increment
      await walletClient.writeContract({
        address: counterAddress,
        abi: counterAbi,
        functionName: 'increment',
      });

      // Verify
      const newValue = await publicClient.readContract({
        address: counterAddress,
        abi: counterAbi,
        functionName: 'get',
      });

      expect(newValue).to.equal(initialValue + 1n);
    });
  });
});
```

### Running Tests

1. Start the node:
   ```bash
   npx hardhat arb:node start --detach --stylus-ready
   ```

2. Run tests:
   ```bash
   npx hardhat test
   ```

## Test Patterns

### Fixtures

<!-- 
Explain fixtures for test isolation:
- Deploy fresh contracts
- Reset state between tests
-->

Use fixtures to ensure clean state:

```typescript
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

async function deployCounterFixture() {
  // Deploy fresh contract
  const counter = await deployCounter();
  return { counter };
}

describe('Counter', () => {
  it('test 1', async () => {
    const { counter } = await loadFixture(deployCounterFixture);
    // Fresh counter for this test
  });

  it('test 2', async () => {
    const { counter } = await loadFixture(deployCounterFixture);
    // Another fresh counter
  });
});
```

### Shared State Warning

<!-- 
Warning about shared state in integration tests
-->

!!! warning "State Persistence"
    Unlike Hardhat Network, the local Arbitrum node persists state across tests. Use fixtures or redeploy contracts for isolation.

## Gas Testing

<!-- 
Measuring and comparing gas consumption
-->

### Measuring Gas

```typescript
it('should use reasonable gas', async () => {
  const hash = await walletClient.writeContract({
    address: counterAddress,
    abi: counterAbi,
    functionName: 'increment',
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  console.log('Gas used:', receipt.gasUsed);
  
  // Assert reasonable gas usage
  expect(receipt.gasUsed).to.be.lessThan(100000n);
});
```

## Best Practices

### 1. Test in Isolation

Each test should be independent. Don't rely on state from previous tests.

### 2. Use Descriptive Names

```typescript
// Good
it('should revert when caller is not owner', async () => {});

// Bad
it('test3', async () => {});
```

### 3. Test Edge Cases

- Zero values
- Maximum values
- Unauthorized callers
- Invalid inputs

### 4. Test Events

```typescript
it('should emit Incremented event', async () => {
  // Test that events are emitted correctly
});
```

## Troubleshooting

### Tests Hang

Ensure the node is running:

```bash
npx hardhat arb:node status
```

### State Not Resetting

The node doesn't reset between tests. Options:

1. Use fixtures that deploy fresh contracts
2. Restart the node between test suites
3. Add reset logic to test setup
