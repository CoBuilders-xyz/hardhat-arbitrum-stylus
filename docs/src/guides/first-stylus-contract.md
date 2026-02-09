# Tutorial: Your First Stylus Contract

<!--
CONTENT DESCRIPTION:
End-to-end tutorial building a Counter contract. Complete walkthrough from setup to deployment.
-->

Build and deploy your first Stylus contract.

## What You'll Build

A **Counter** contract with `get()`, `increment()`, and `set()` functions.

**Time:** 30 minutes

## Step 1: Project Setup

```bash
mkdir my-first-stylus && cd my-first-stylus
pnpm init
pnpm add hardhat @cobuilders/hardhat-arbitrum-stylus
pnpm add -D typescript @types/node
```

Create `hardhat.config.ts`:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
};

export default config;
```

## Step 2: Create Stylus Contract

```bash
mkdir -p contracts/stylus && cd contracts/stylus
cargo stylus new counter && cd counter
```

Replace `src/lib.rs`:

```rust
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
        self.value.set(current + U256::from(1));
    }

    pub fn set(&mut self, new_value: u256) {
        self.value.set(new_value);
    }
}
```

## Step 3: Start Local Node

Open a new terminal at project root:

```bash
npx hardhat arb:node start --stylus-ready
```

Wait for "Listening for transactions..."

## Step 4: Deploy Contract

In the contract directory (`contracts/stylus/counter`):

```bash
cargo stylus check --endpoint http://localhost:8547
```

Deploy:

```bash
cargo stylus deploy \
  --endpoint http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Save the deployed address from output: `deployed code at address: 0x...`

## Step 5: Interact

Replace `CONTRACT_ADDRESS` with your address:

```bash
# Read counter (returns 0)
cast call CONTRACT_ADDRESS "get()(uint256)" --rpc-url http://localhost:8547

# Increment
cast send CONTRACT_ADDRESS "increment()" \
  --rpc-url http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Read again (returns 1)
cast call CONTRACT_ADDRESS "get()(uint256)" --rpc-url http://localhost:8547
```

## Step 6: Clean Up

Stop the node: `npx hardhat arb:node stop`

## What You Learned

- Setting up a Hardhat project with Stylus plugins
- Writing Stylus contracts in Rust
- Running a local Arbitrum node
- Deploying and interacting with contracts

## Next Steps

- [Node Plugin Reference](../plugins/node.md)
- [Local Development Guide](local-development.md)
