# Local Development Workflow

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This guide covers setting up an optimal local development workflow.

WHAT TO WRITE:
- Complete local development setup
- Recommended project structure
- Development workflow patterns
- Hot reload and iteration tips
- Multi-terminal setup
- Integration with IDE

SECTIONS TO INCLUDE:

1. Project Structure
   - Recommended directory layout
   - Stylus contracts location
   - Solidity contracts location
   - Tests location
   - Scripts location

2. Development Workflow
   - Start node → compile → deploy → test cycle
   - Iterative development
   - Using --detach for background node

3. Terminal Setup
   - Multi-terminal workflow
   - Terminal 1: Node
   - Terminal 2: Development tasks

4. IDE Integration
   - VS Code setup
   - Rust analyzer configuration
   - Solidity extension

5. Tips and Best Practices
   - Keep node running in background
   - Use --stylus-ready for Stylus development
   - Snapshot and restore (future feature)

REFERENCE MATERIALS:
- Node plugin documentation
- Rust/Stylus development best practices
- Hardhat workflow patterns

=============================================================================
-->

This guide covers setting up an efficient local development workflow for Stylus development.

## Project Structure

<!-- 
Recommended project layout:
my-stylus-project/
├── contracts/
│   ├── stylus/           # Rust Stylus contracts
│   │   └── counter/
│   │       ├── Cargo.toml
│   │       └── src/
│   └── solidity/         # Solidity contracts
├── test/
├── scripts/
├── hardhat.config.ts
└── package.json
-->

Recommended project structure:

```
my-stylus-project/
├── contracts/
│   ├── stylus/           # Rust Stylus contracts
│   │   └── counter/
│   │       ├── Cargo.toml
│   │       └── src/
│   │           └── lib.rs
│   └── solidity/         # Solidity contracts (if any)
│       └── Proxy.sol
├── test/                  # Test files
│   └── counter.test.ts
├── scripts/               # Deployment scripts
│   └── deploy.ts
├── artifacts/             # Build artifacts
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

## Development Workflow

### 1. Start the Local Node

Start the node in detached mode:

```bash
npx hardhat arb:node start --detach --stylus-ready
```

Verify it's running:

```bash
npx hardhat arb:node status
```

### 2. Develop Your Contract

<!-- 
Explain the development iteration:
- Write code
- Compile
- Deploy
- Test
- Repeat
-->

Edit your Stylus contract:

```rust
// contracts/stylus/counter/src/lib.rs
#![cfg_attr(not(feature = "std"), no_std)]

use stylus_sdk::prelude::*;

sol_storage! {
    #[entrypoint]
    pub struct Counter {
        uint256 value;
    }
}

#[public]
impl Counter {
    pub fn get(&self) -> u256 {
        self.value.get()
    }
    
    pub fn increment(&mut self) {
        let current = self.value.get();
        self.value.set(current + 1);
    }
}
```

### 3. Compile and Deploy

<!-- Placeholder for future arb:compile integration -->

```bash
# Navigate to Stylus contract
cd contracts/stylus/counter

# Check compilation
cargo stylus check --endpoint http://localhost:8547

# Deploy
cargo stylus deploy \
  --endpoint http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 4. Test

Run your tests:

```bash
npx hardhat test
```

### 5. Iterate

Repeat steps 2-4 as you develop.

## Terminal Setup

### Recommended Multi-Terminal Layout

**Terminal 1: Node**
```bash
# Start and follow logs
npx hardhat arb:node start --stylus-ready
```

**Terminal 2: Development**
```bash
# Compile, deploy, test
cargo stylus check --endpoint http://localhost:8547
npx hardhat test
```

### Background Node Alternative

```bash
# Terminal 1: Start in background
npx hardhat arb:node start --detach --stylus-ready

# Same terminal: Do everything else
cargo stylus check --endpoint http://localhost:8547
npx hardhat test

# When done
npx hardhat arb:node stop
```

## IDE Setup

### VS Code Extensions

<!-- 
Recommended extensions:
- rust-analyzer
- Solidity (Hardhat)
- Even Better TOML
-->

Recommended extensions for Stylus development:

- **rust-analyzer** — Rust language support
- **Solidity** — Solidity language support
- **Even Better TOML** — Cargo.toml editing

### Workspace Settings

```json
// .vscode/settings.json
{
  "rust-analyzer.linkedProjects": [
    "contracts/stylus/counter/Cargo.toml"
  ],
  "rust-analyzer.cargo.target": "wasm32-unknown-unknown"
}
```

## Tips and Best Practices

### Use --stylus-ready

Always use `--stylus-ready` when developing Stylus contracts:

```bash
npx hardhat arb:node start --stylus-ready
```

This deploys the necessary infrastructure for Stylus contract deployment.

### Keep Node Running

Don't restart the node unnecessarily. Each restart:

- Resets all contract state
- Requires re-deployment
- Takes several seconds

### Watch Node Logs

Monitor logs for transaction activity:

```bash
npx hardhat arb:node logs --follow
```

### Use Consistent Accounts

Use the pre-funded accounts consistently:

```typescript
// Use Account #0 for deployments
const DEPLOYER = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Use other accounts for testing
const USER_1 = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
```

## Shutting Down

When you're done:

```bash
npx hardhat arb:node stop
```

This cleanly stops and removes the Docker container.
