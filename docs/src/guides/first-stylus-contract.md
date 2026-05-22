# Your First Stylus Contract

Build, deploy, and test a Stylus counter contract using only the plugin's `arb:*` tasks.

**Time:** ~30 minutes (first Docker compile may take longer)

## What You'll Build

A **Counter** contract with `count()`, `increment()`, and a Hardhat test that deploys it via `stylusViem`.

## Step 1: Create the Project

```bash
mkdir my-first-stylus && cd my-first-stylus
npx @cobuilders/hardhat-arbitrum-stylus --init
```

The initializer creates:

- `hardhat.config.ts` with the plugin configured
- `contracts/stylus-counter/` a ready-to-use Stylus counter
- `contracts/SolidityCounter.sol` a Solidity counter for cross-VM tests
- `test/cross-vm.test.ts` example tests

!!! tip "Docker file sharing on Linux"

    If `arb:compile` fails with "path is not shared from the host", create your project outside `/tmp`. Use your home directory or workspace Docker Desktop must have that path in **Settings → Resources → File Sharing**.

## Step 2: Understand the Contract

The scaffolded counter lives at `contracts/stylus-counter/src/lib.rs`:

```rust
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use stylus_sdk::{alloy_primitives::U256, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct Counter {
        uint256 count;
    }
}

#[public]
impl Counter {
    pub fn count(&self) -> U256 {
        self.count.get()
    }

    pub fn increment(&mut self) {
        let count = self.count.get();
        self.count.set(count + U256::from(1));
    }
}
```

Each Stylus contract is a directory under `contracts/` with:

| File                  | Purpose                         |
| --------------------- | ------------------------------- |
| `Cargo.toml`          | Must depend on `stylus-sdk`     |
| `rust-toolchain.toml` | Pins the Rust toolchain version |
| `Stylus.toml`         | Stylus SDK configuration        |
| `src/lib.rs`          | Contract logic                  |

## Step 3: Compile

```bash
npx hardhat arb:compile
```

This compiles Solidity and all Stylus contracts. Artifacts are written to `artifacts/contracts/<name>/<name>.json`.

To compile only Stylus contracts:

```bash
npx hardhat arb:compile --stylus
```

## Step 4: Start a Local Node (optional)

For manual deploys against a persistent node:

```bash
npx hardhat arb:node start --detach
```

Tests and deploys without `--network` start their own temporary node automatically you can skip this step if you only plan to test.

## Step 5: Deploy

```bash
npx hardhat arb:deploy stylus-counter
```

Expected output:

```
✓ stylus-counter deployed
  Address: 0x...
```

The plugin discovers the contract by folder name (`stylus-counter`), compiles if needed, and runs `cargo stylus deploy` inside Docker (or on the host with `--host`).

## Step 6: Write a Test

Create `test/counter.test.ts`:

```typescript
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Counter', async function () {
  const { stylusViem } = await network.create();

  it('starts at 0 and increments', async function () {
    const counter = await stylusViem.deployContract('stylus-counter');

    assert.equal(await counter.read.count(), 0n);
    await counter.write.increment();
    assert.equal(await counter.read.count(), 1n);
  });
});
```

## Step 7: Run Tests

```bash
npx hardhat arb:test
```

Or run a single file:

```bash
npx hardhat arb:test test/counter.test.ts
```

`arb:test` compiles Solidity, starts a temporary Nitro node, compiles Stylus contracts, deploys them in each test, and runs the Node.js test runner.

## Step 8: Clean Up

```bash
npx hardhat arb:node stop
```

## What You Learned

- Project layout for Stylus contracts (`contracts/<name>/`)
- `arb:compile` for Rust/WASM compilation
- `arb:deploy` for on-chain deployment
- `arb:test` with `stylusViem.deployContract()`
- Cross-VM interaction (Solidity + Stylus on the same chain)

## Next Steps

- [Deploy Plugin](../plugins/deploy.md) constructor args, networks, `stylusViem` API
- [Test Plugin](../plugins/test.md) host mode, assertions, concurrency
- [Real-World Examples](../examples/index.md) production contract test suites
- [Troubleshooting](troubleshooting.md) Docker, ports, toolchain issues
