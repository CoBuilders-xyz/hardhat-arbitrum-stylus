# Local Development

Set up an efficient local development workflow for Stylus development.

## Project Structure

```
my-stylus-project/
├── contracts/
│   └── stylus/           # Rust Stylus contracts
│       └── counter/
│           ├── Cargo.toml
│           └── src/lib.rs
├── test/                  # Tests
├── hardhat.config.ts
└── package.json
```

## Workflow

### 1. Start Node (Background)

```bash
npx hardhat arb:node start --detach --stylus-ready
```

### 2. Develop

Edit your contract, then:

```bash
cd contracts/stylus/counter
cargo stylus check --endpoint http://localhost:8547
```

### 3. Deploy

```bash
cargo stylus deploy \
  --endpoint http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 4. Test

```bash
npx hardhat test
```

### 5. Iterate

Repeat steps 2-4.

## Auto-Start for Tests

Tests can run **without manually starting the node**. The plugin automatically starts a temporary node when you connect to the default network:

```typescript
// test/Counter.test.ts
import { describe, it } from 'node:test';

describe('Counter', () => {
  it('should increment', async () => {
    // Node starts automatically when connecting
    const connection = await hre.network.connect();
    // ... test logic
  });
});
```

```bash
# Just run tests - no need to start the node first
npx hardhat test
```

!!! info "Temporary Containers"
Auto-started nodes use random ports and are cleaned up automatically when the test process exits.

### When to Use Manual vs Auto-Start

| Scenario                   | Approach                             |
| -------------------------- | ------------------------------------ |
| Running tests              | Auto-start (just `npx hardhat test`) |
| Quick script execution     | Auto-start                           |
| Stylus contract deployment | Manual with `--stylus-ready`         |
| Interactive development    | Manual for persistence               |
| Debugging with logs        | Manual for log access                |

## When to Use --stylus-ready

| Contract Type      | `--stylus-ready` Needed?   |
| ------------------ | -------------------------- |
| Stylus (Rust/WASM) | Yes                        |
| Solidity (EVM)     | No                         |
| Mixed project      | Yes (for Stylus contracts) |

The `--stylus-ready` flag deploys infrastructure needed for Stylus contracts:

- CREATE2 Factory for deterministic addresses
- Cache Manager for WASM caching
- StylusDeployer helper contract

For EVM-only contracts, skip this flag for faster startup:

```bash
npx hardhat arb:node start --detach  # Faster, no Stylus infra
```

## Terminal Setup

**Option A: Two terminals**

- Terminal 1: `npx hardhat arb:node start --stylus-ready` (foreground, shows logs)
- Terminal 2: Development commands

**Option B: Background mode**

```bash
npx hardhat arb:node start --detach --stylus-ready
npx hardhat arb:node logs --follow  # When you need logs
```

## Tips

### Don't Restart Unnecessarily

Each restart resets state. Keep the node running during development.

### Use Consistent Accounts

```typescript
// Account #0 - use for deployments
const DEPLOYER =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Account #1 - use for user interactions
const USER =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
```

### Monitor Logs

```bash
npx hardhat arb:node logs --follow
```

### Check Node Status

```bash
npx hardhat arb:node status
```

## Shutting Down

```bash
npx hardhat arb:node stop
```

!!! note

    Temporary nodes from auto-start are cleaned up automatically. You only need to stop manually-started nodes.
