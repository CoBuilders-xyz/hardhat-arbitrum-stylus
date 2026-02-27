# Test Plugin

**Package:** `@cobuilders/hardhat-arb-test`

**Status:** ✅ Available

[:fontawesome-brands-github: Source](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages/hardhat-arb-test){ .md-button }
[:fontawesome-brands-npm: npm](https://www.npmjs.com/package/@cobuilders/hardhat-arb-test){ .md-button }

Run TypeScript tests that deploy and exercise **both EVM (Solidity) and Stylus (WASM) contracts** in the same project, using the same testing workflow you already use with Hardhat.

---

## Quick Start

### 1. Configure your project

```typescript title="hardhat.config.ts"
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';
import HardhatViem from '@nomicfoundation/hardhat-viem';
import HardhatViemAssertions from '@nomicfoundation/hardhat-viem-assertions';
import HardhatNodeTestRunner from '@nomicfoundation/hardhat-node-test-runner';

export default {
  plugins: [
    hardhatArbitrumStylus,
    HardhatViem,
    HardhatViemAssertions,
    HardhatNodeTestRunner,
  ],
  solidity: '0.8.24',
};
```

### 2. Write a test

```typescript title="test/counter.test.ts"
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Counter', async function () {
  const { stylusViem } = await network.connect();

  it('deploys and interacts with a Solidity counter', async function () {
    const counter = await stylusViem.deployContract('SolidityCounter');

    await counter.write.increment();
    assert.equal(await counter.read.count(), 1n);
  });

  it('deploys and interacts with a Stylus counter', async function () {
    const counter = await stylusViem.deployContract('stylus-counter');

    await counter.write.increment();
    assert.equal(await counter.read.count(), 1n);
  });
});
```

### 3. Run tests

```bash
npx hardhat arb:test
```

This starts a local Arbitrum node automatically and runs your tests. Solidity contracts are compiled before tests run. Stylus contracts are compiled and deployed on-the-fly via `cargo stylus deploy`.

---

## Command Reference

```bash
npx hardhat arb:test [testFiles...] [options]
```

### Arguments

| Argument    | Description                          |
| ----------- | ------------------------------------ |
| `testFiles` | Optional list of specific test files |

### Options

| Option         | Description                                          |
| -------------- | ---------------------------------------------------- |
| `--host`       | Use host Rust toolchain instead of Docker for Stylus |
| `--only`       | Run tests marked with `.only`                        |
| `--grep <str>` | Only run tests matching the given string             |
| `--no-compile` | Skip Solidity compilation before tests               |

### Examples

```bash
# Run all tests (uses Docker containers by default, sequential)
npx hardhat arb:test

# Run with host Rust toolchain (faster, parallel)
npx hardhat arb:test --host

# Run a specific test file
npx hardhat arb:test test/counter.test.ts

# Run only matching tests
npx hardhat arb:test --grep "Stylus"

# Skip Solidity compilation
npx hardhat arb:test --no-compile
```

---

## How It Works

### stylusViem Integration

The deploy plugin adds `stylusViem` to the network connection alongside the original `viem` from hardhat-viem. The original `viem` is left completely untouched.

- **`stylusViem`** — Stylus-aware helpers. Handles both Solidity and Stylus contracts. **Use this for all contract interactions.**

When you call `stylusViem.deployContract()`:

- **Solidity contracts** are routed to the original viem deploy path
- **Stylus contracts** are deployed via `cargo stylus deploy` (compiles, deploys, and activates in one step)

Both paths return the same viem contract instance with `.read`, `.write`, and `.getEvents` methods. No separate compile step is needed for Stylus — `cargo stylus deploy` handles compilation internally.

### Container vs Host Toolchain

By default, `arb:test` uses **Docker containers** for Stylus compilation and deployment. Because spinning up parallel containers for devnodes and Stylus compilation is very resource intensive, tests run **sequentially** (`--test-concurrency=1`) using the Node.js test runner.

Use `--host` to deploy Stylus contracts using your **local Rust toolchain** instead. Host mode uses the full Hardhat test runner with parallel execution, making it significantly faster. This requires `rustup`, `cargo-stylus`, and the contract's toolchain installed locally (see [Deploy Plugin](deploy.md#host-mode) for setup). If you're running tests frequently during development, host mode is recommended.

### Automatic Node Management

When a test calls `network.connect()`, the node plugin automatically starts a local Arbitrum nitro-devnode if one isn't already running. It stops the node when the connection closes.

### Assertions

Use `stylusViem.assertions` for all assertion helpers. It inherits `emit`, `emitWithArgs`, and `balancesHaveChanged` from `viem.assertions`, and overrides all revert-related assertions for Arbitrum node compatibility.

```typescript
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Assertions example', async function () {
  const { stylusViem } = await network.connect();
  const counter = await stylusViem.deployContract('SolidityCounter');

  it('emits CountChanged', async function () {
    await stylusViem.assertions.emit(
      counter.write.increment(),
      counter,
      'CountChanged',
    );
  });

  it('reverts on decrement at zero', async function () {
    await stylusViem.assertions.revert(counter.write.decrement());
  });

  it('reverts with reason', async function () {
    await stylusViem.assertions.revertWith(
      counter.write.decrement(),
      'Counter: cannot decrement below zero',
    );
  });

  it('reverts with custom error', async function () {
    await stylusViem.assertions.revertWithCustomError(
      counter.write.decrementCustom(),
      counter,
      'Underflow',
    );
  });

  it('reverts with custom error and args', async function () {
    await stylusViem.assertions.revertWithCustomErrorWithArgs(
      counter.write.setCountChecked([2000n]),
      counter,
      'InvalidCount',
      [5n, 2000n],
    );
  });
});
```

!!! note "Why stylusViem.assertions?"

    The standard `viem.assertions` revert helpers require raw hex revert data, which is available when Hardhat uses its built-in EDR node but gets stripped when connecting to external nodes via HTTP (like the Arbitrum `nitro-devnode`). `stylusViem.assertions` replaces all four revert methods with implementations that work on any Arbitrum node. `emit`, `emitWithArgs`, and `balancesHaveChanged` are passed through unchanged.

#### Custom Errors in Stylus Contracts

Stylus (Rust) contracts can define custom errors using `alloy_sol_types::sol!` and return ABI-encoded error data:

```rust
use alloy_sol_types::{sol, SolError};

sol! {
    error NotOwner(address caller, address owner);
}

// In your contract method:
return Err(NotOwner { caller, owner }.abi_encode());
```

These custom errors are testable with `stylusViem.assertions.revertWithCustomError`:

```typescript
await stylusViem.assertions.revertWithCustomError(
  proxy.write.restrictedFn(),
  proxy,
  'NotOwner',
);
```

!!! note "Stylus ABI Limitation"

    `cargo stylus export-abi` does not include `sol!`-defined custom errors in the exported ABI. For Solidity contracts, `revertWithCustomError` fully decodes the error name and args. For Stylus contracts, the assertion verifies the call reverted with a custom error signature (not a string revert or panic) but cannot verify the specific error name or arguments.

### Cross-VM Interaction

Solidity and Stylus contracts deployed in the same test suite share the same on-chain state. You can have Solidity contracts call Stylus contracts and vice versa.

---

## Prerequisites

| Requirement                                 | Purpose                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| Docker                                      | Local Arbitrum node + Stylus deploy (default)              |
| `rustup` + `cargo-stylus`                   | Host Rust toolchain for Stylus deployments (`--host` mode) |
| `@nomicfoundation/hardhat-viem`             | viem integration for Hardhat                               |
| `@nomicfoundation/hardhat-viem-assertions`  | Test assertions (`emit`, `revert`, `balancesHaveChanged`)  |
| `@nomicfoundation/hardhat-node-test-runner` | Node.js test runner for Hardhat                            |

!!! note "Host Mode Prerequisites"

    The `--host` flag requires `rustup`, `cargo-stylus`, and the contract's toolchain installed locally. See the [Deploy Plugin](deploy.md#host-mode) for setup instructions.
