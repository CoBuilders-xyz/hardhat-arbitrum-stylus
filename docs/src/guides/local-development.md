# Local Development

<!-- 
CONTENT DESCRIPTION:
Development workflow guide. How to set up efficient local development.
-->

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

### Always Use --stylus-ready

For Stylus development:

```bash
npx hardhat arb:node start --stylus-ready
```

### Don't Restart Unnecessarily

Each restart resets state. Keep the node running during development.

### Use Consistent Accounts

```typescript
// Account #0 - use for deployments
const DEPLOYER = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Account #1 - use for user interactions
const USER = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
```

### Monitor Logs

```bash
npx hardhat arb:node logs --follow
```

## Shutting Down

```bash
npx hardhat arb:node stop
```
