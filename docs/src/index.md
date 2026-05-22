# Hardhat Arbitrum Stylus Plugin

[![GitHub](https://img.shields.io/badge/GitHub-CoBuilders--xyz%2Fhardhat--arbitrum--stylus-blue?logo=github)](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus)
[![npm](https://img.shields.io/npm/v/@cobuilders/hardhat-arbitrum-stylus?logo=npm)](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus)

Hardhat plugin suite for Arbitrum Stylus development. Compile, deploy, and test Rust (WASM) and Solidity contracts with hardhat framework.
!!! tip "Alpha Status"

    This suite is under active development. APIs and workflows may evolve between releases.

## What's Included

`@cobuilders/hardhat-arbitrum-stylus` is a **plugin bundler** that includes all the individual plugins:

| Plugin                            | Task          | What it does                                      |
| --------------------------------- | ------------- | ------------------------------------------------- |
| `@cobuilders/hardhat-arb-node`    | `arb:node`    | Run a local Arbitrum Nitro devnode                |
| `@cobuilders/hardhat-arb-compile` | `arb:compile` | Compile Stylus (Rust/WASM) and Solidity contracts |
| `@cobuilders/hardhat-arb-deploy`  | `arb:deploy`  | Deploy Solidity and Stylus contracts              |
| `@cobuilders/hardhat-arb-test`    | `arb:test`    | Run tests across both VMs                         |

## Prerequisites

- **Hardhat v3** (Hardhat v2 is not supported).
- **Node.js v22+**: [nodejs.org](https://nodejs.org) or `nvm install 22`.
- **Docker**: latest version from [docker.com](https://docker.com) required for the default compile/deploy/test workflow.
- **npm**: bundled with Node.js.

!!! warning "Hardhat 3 Required"

    This plugin uses Hardhat 3's plugin system. It is **not compatible** with Hardhat v2.

## Installation

You can add this plugin to an **existing Hardhat 3 project** or create a new one.

### New Hardhat Project

If you are starting from scratch, use the Stylus initializer:

```bash
mkdir my-stylus-project && cd my-stylus-project
npx @cobuilders/hardhat-arbitrum-stylus --init
```

This scaffolds a Hardhat 3 + viem project with example Stylus and Solidity contracts, cross-VM tests, and the plugin already configured.

### Add to Existing Hardhat Project

If you already have a Hardhat 3 project, install the plugin and required dependencies:

```bash
npm install -D "@cobuilders/hardhat-arbitrum-stylus" "@nomicfoundation/hardhat-toolbox-viem@^5.0.2"
```

Add the plugin to your `hardhat.config.ts`:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, hardhatArbitrumStylus],
};

export default config;
```

### Verify Installation

```bash
npx hardhat --help
# Should list arb:node, arb:compile, arb:deploy, arb:test
```

## Quick Start

This walkthrough uses the project scaffolded by `--init`. If you added the plugin to an existing project, adapt the contract names to match your setup.

### 1. Start a local Arbitrum node

```bash
npx hardhat arb:node start --detach
```

The node runs at `http://localhost:8547` with 20 pre-funded accounts and Stylus infrastructure already deployed (CREATE2 factory, Cache Manager, StylusDeployer).

### 2. Compile contracts

```bash
npx hardhat arb:compile
```

Compiles both Solidity contracts and Stylus contracts (Rust → WASM). On the first run, Docker builds a compile image, this can take several minutes. Subsequent runs use the cached image.

### 3. Deploy a Stylus contract

```bash
npx hardhat arb:deploy stylus-counter
```

Deploys the `stylus-counter` contract from `contracts/stylus-counter/`. Without `--network`, the plugin starts a temporary node, deploys, and cleans up.

### 4. Run tests

```bash
npx hardhat arb:test
```

Runs all tests in `test/`. The scaffolded project includes cross-VM tests that deploy and interact with both Solidity and Stylus contracts on the same chain.

### 5. Stop the node

```bash
npx hardhat arb:node stop
```

## Writing a Test

Tests use `stylusViem`, a viem-compatible API that routes Solidity contracts to standard viem and Stylus contracts to `cargo stylus deploy`:

```typescript
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('My Stylus contract', async function () {
  const { stylusViem } = await network.create();

  it('deploys and increments', async function () {
    const counter = await stylusViem.deployContract('stylus-counter');
    assert.equal(await counter.read.count(), 0n);

    await counter.write.increment();
    assert.equal(await counter.read.count(), 1n);
  });
});
```

`network.create()` automatically starts a temporary Arbitrum node for the test -- you do not need to run `arb:node start` first.

## Next Steps

- [Your First Stylus Contract](guides/first-stylus-contract.md) step-by-step tutorial
- [Configuration](hardhat.config.ts.md) all `stylus.*` options
- [Plugins Overview](plugins/index.md) detailed reference for each plugin
- [Real-World Examples](examples/index.md) integration tests against production Stylus contracts
- [Troubleshooting](guides/troubleshooting.md) common issues and fixes
