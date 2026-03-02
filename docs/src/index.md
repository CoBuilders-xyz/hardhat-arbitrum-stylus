# Hardhat Arbitrum Stylus Plugin

[![GitHub](https://img.shields.io/badge/GitHub-CoBuilders--xyz%2Fhardhat--arbitrum--stylus-blue?logo=github)](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus)
[![npm](https://img.shields.io/npm/v/@cobuilders/hardhat-arbitrum-stylus?logo=npm)](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus)

Hardhat plugin suite for Arbitrum Stylus development.

!!! tip "Alpha Status"

    This suite is under active development. APIs and workflows may evolve between releases.

## What's Included

`@cobuilders/hardhat-arbitrum-stylus` is a **plugin bundler** that includes all the individual plugins:

- `@cobuilders/hardhat-arb-node`: Run a local Arbitrum node.
- `@cobuilders/hardhat-arb-compile`: Compile Stylus contracts.
- `@cobuilders/hardhat-arb-deploy`: Deploy Solidity and Stylus contracts.
- `@cobuilders/hardhat-arb-test`: Run tests across Solidity and Stylus.

## Prerequisites

- **Hardhat v3** (Hardhat v2 is not supported).
- **Node.js v22+**: [nodejs.org](https://nodejs.org) or `nvm install 22`.
- **Docker**: latest version from [docker.com](https://docker.com).
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

This command scaffolds a Hardhat 3 + viem project and wires the Arbitrum Stylus setup.

### Add to Existing Hardhat Project

If you already have a Hardhat 3 project, install the plugin and required dependencies:

```bash
npm install -D "@cobuilders/hardhat-arbitrum-stylus" "@nomicfoundation/hardhat-toolbox-viem@^5.0.2"
```

### Configure Hardhat

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
# Should show arb:* commands
```

## Quick Start

Start a local Arbitrum node:

```bash
npx hardhat arb:node start
```

You'll see pre-funded accounts and the RPC endpoint:

```
Started HTTP Server at http://localhost:8547/
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10 ETH)
...
```
