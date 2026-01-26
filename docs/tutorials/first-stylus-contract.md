# Your First Stylus Contract

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This is a complete tutorial for building and deploying a first Stylus contract.

WHAT TO WRITE:
- End-to-end tutorial from empty directory to deployed contract
- Step-by-step with explanations
- Code examples with detailed comments
- What to expect at each step
- Verification steps

SECTIONS TO INCLUDE:

1. Introduction
   - What you'll build (Counter contract)
   - What you'll learn
   - Time estimate

2. Project Setup
   - Create directory
   - Initialize Hardhat project
   - Install plugin
   - Configure hardhat.config.ts

3. Create Stylus Contract
   - Initialize Rust project with cargo stylus
   - Write the Counter contract
   - Explain each part of the code

4. Start Local Node
   - Run arb:node start --stylus-ready
   - Explain what's happening
   - Verify node is running

5. Compile the Contract
   - cargo stylus check
   - Explain compilation process
   - Troubleshoot common errors

6. Deploy the Contract
   - cargo stylus deploy
   - Note the deployed address
   - Explain what happened

7. Interact with the Contract
   - Use curl or script to call methods
   - Read the counter value
   - Increment the counter
   - Read again to verify

8. Clean Up
   - Stop the node
   - Summary of what was learned

9. Next Steps
   - Links to further learning
   - Ideas for extending the contract

REFERENCE MATERIALS:
- Stylus SDK documentation
- cargo-stylus documentation
- Node plugin documentation
- Counter contract examples

IMPORTANT:
- This is a TUTORIAL, so explain WHY at each step
- Include expected output for each command
- Add troubleshooting tips
- Make it encouraging and celebratory when things work

=============================================================================
-->

Build and deploy your first Stylus contract using Hardhat Arbitrum Stylus.

## What You'll Build

A simple **Counter** contract that:

- Stores a number
- Has a `get()` function to read the value
- Has an `increment()` function to increase it

## What You'll Learn

- Setting up a Hardhat project with Stylus support
- Writing a Stylus contract in Rust
- Running a local Arbitrum node
- Deploying and interacting with your contract

## Prerequisites

- [Prerequisites installed](../getting-started/prerequisites.md)
- 30-45 minutes

## Step 1: Create Project

Create a new directory and initialize:

```bash
mkdir my-first-stylus
cd my-first-stylus
```

Initialize the package:

```bash
npm init -y
```

Install dependencies:

```bash
npm install hardhat @cobuilders/hardhat-arbitrum-stylus
npm install -D typescript @types/node
```

## Step 2: Configure Hardhat

Create `hardhat.config.ts`:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
};

export default config;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true
  }
}
```

Verify the setup:

```bash
npx hardhat --help
```

You should see `arb:node` in the task list. 🎉

## Step 3: Create Stylus Contract

Create a directory for your Stylus contract:

```bash
mkdir -p contracts/stylus
cd contracts/stylus
```

Initialize a new Stylus project:

```bash
cargo stylus new counter
cd counter
```

<!-- 
This creates:
counter/
├── Cargo.toml
└── src/
    └── lib.rs
-->

Open `src/lib.rs` and replace with:

```rust
// Disable the standard library (required for WASM)
#![cfg_attr(not(feature = "std"), no_std)]

// Import the Stylus SDK
use stylus_sdk::prelude::*;

// Define storage layout
sol_storage! {
    #[entrypoint]
    pub struct Counter {
        uint256 value;
    }
}

// Define public methods
#[public]
impl Counter {
    // Read the current value
    pub fn get(&self) -> u256 {
        self.value.get()
    }

    // Increment the value by 1
    pub fn increment(&mut self) {
        let current = self.value.get();
        self.value.set(current + U256::from(1));
    }

    // Set the value directly
    pub fn set(&mut self, new_value: u256) {
        self.value.set(new_value);
    }
}
```

**Let's understand this code:**

<!-- 
Explain each part:
- #![cfg_attr...] - WASM doesn't have std
- sol_storage! - Defines storage like Solidity
- #[entrypoint] - Marks the contract entry point
- #[public] - Makes methods callable from outside
-->

## Step 4: Start Local Node

Go back to the project root:

```bash
cd ../../..  # Back to my-first-stylus/
```

Start the local Arbitrum node with Stylus support:

```bash
npx hardhat arb:node start --stylus-ready
```

Wait for the startup message:

```
Started HTTP Server at http://localhost:8547/
...
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10 ETH)
...
Listening for transactions...
```

🎉 Your local Arbitrum node is running!

**Keep this terminal open** and open a new terminal for the next steps.

## Step 5: Check Contract

In a new terminal, navigate to the counter contract:

```bash
cd my-first-stylus/contracts/stylus/counter
```

Check that the contract compiles correctly:

```bash
cargo stylus check --endpoint http://localhost:8547
```

Expected output:

```
contract size: XXXX bytes
wasm data fee: 0.XXXXXX ETH
```

If you see this, your contract is ready to deploy! 🎉

## Step 6: Deploy Contract

Deploy using cargo-stylus:

```bash
cargo stylus deploy \
  --endpoint http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Note:** This uses the pre-funded Account #0.

Expected output:

```
deployed code at address: 0x...
```

📝 **Save this address!** You'll need it to interact with your contract.

## Step 7: Interact with Contract

Let's call our contract! Replace `CONTRACT_ADDRESS` with your deployed address:

### Read the Counter

```bash
cast call CONTRACT_ADDRESS "get()(uint256)" --rpc-url http://localhost:8547
```

Expected output: `0` (initial value)

### Increment the Counter

```bash
cast send CONTRACT_ADDRESS "increment()" \
  --rpc-url http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Read Again

```bash
cast call CONTRACT_ADDRESS "get()(uint256)" --rpc-url http://localhost:8547
```

Expected output: `1` 🎉

You've deployed and interacted with your first Stylus contract!

## Step 8: Clean Up

In the terminal running the node, press `Ctrl+C` to stop it.

Or in another terminal:

```bash
npx hardhat arb:node stop
```

## What You Learned

- ✅ Setting up a Hardhat project with Stylus plugins
- ✅ Writing a Stylus contract in Rust
- ✅ Running a local Arbitrum node
- ✅ Deploying with cargo-stylus
- ✅ Interacting with your contract

## Next Steps

- **[Local Development Guide](../guides/local-development.md)** — Optimize your workflow
- **[Testing Guide](../guides/testing-stylus.md)** — Write tests for your contracts
- **[Node Plugin Reference](../plugins/node.md)** — Explore all node options

## Challenge: Extend the Contract

Try adding these features to your counter:

1. A `decrement()` function
2. A `reset()` function
3. An event that emits when the value changes

<!-- 
Hints:
- Use Stylus SDK events
- Check the SDK documentation
-->
