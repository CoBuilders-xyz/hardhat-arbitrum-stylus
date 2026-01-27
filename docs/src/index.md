# Hardhat Arbitrum Stylus Plugin

Hardhat plugin suite for Arbitrum Stylus development.

!!! tip "Beta Status"
    Some features are coming soon. See [Plugins](plugins/index.md) for current status.

## What's Included

`@cobuilders/hardhat-arbitrum-stylus` is a **plugin bundler** that includes all the individual plugins:

| Plugin | Description | Status |
|--------|-------------|--------|
| `@cobuilders/hardhat-arb-node` | Run local Arbitrum node | ✅ Available |
| `@cobuilders/hardhat-arb-compile` | Compile Stylus contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-deploy` | Deploy contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-test` | Test runner | 🔜 Coming Soon |

## Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| **Hardhat** | **v3** | Required (v2 not supported) |
| Node.js | v22+ | [nodejs.org](https://nodejs.org) or `nvm install 22` |
| Docker | Latest | [docker.com](https://docker.com) |
| pnpm/npm/yarn | Latest | Package manager |

!!! warning "Hardhat 3 Required"
    This plugin uses Hardhat 3's plugin system. It is **not compatible** with Hardhat v2.

## Installation

You can add this plugin to an **existing Hardhat 3 project** or create a new one.

### New Project

If starting from scratch:

```bash
mkdir my-stylus-project && cd my-stylus-project
npm init -y
npm install hardhat
npx hardhat --init
```

Choose any template (Viem, Ethers, or minimal) — all work with this plugin.

### Add to Existing Project

If you already have a Hardhat 3 project, skip to installing the plugin.

### Install the Plugin

=== "npm / yarn"

    ```bash
    npm install @cobuilders/hardhat-arbitrum-stylus
    # or
    yarn add @cobuilders/hardhat-arbitrum-stylus
    ```
    
    npm and yarn automatically install peer dependencies.

=== "pnpm"

    ```bash
    pnpm add @cobuilders/hardhat-arbitrum-stylus
    ```
    
    pnpm does not install peer dependencies automatically. You may need to install them manually:
    
    ```bash
    pnpm add @cobuilders/hardhat-arb-node @cobuilders/hardhat-arb-compile \
             @cobuilders/hardhat-arb-deploy @cobuilders/hardhat-arb-test
    ```

!!! info "Init Script (Coming Soon)"
    We're working on `npx hardhat arb --init` to automate project setup and peer dependency installation.

### Configure Hardhat

Add the plugin to your `hardhat.config.ts`:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
};

export default config;
```

### Verify Installation

```bash
npx hardhat --help
# Should show arb:node commands
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

### Stylus-Ready Mode

!!! warning "Work in Progress"
    The `--stylus-ready` flag is experimental. We're still working on Cache Manager support for nitro-devnode testing environments.

For Stylus contract deployment, use `--stylus-ready` to deploy the required infrastructure:

```bash
npx hardhat arb:node start --stylus-ready
```

This deploys CREATE2 Factory, Cache Manager, and StylusDeployer contracts.

## Next Steps

- [Node Plugin](plugins/node.md) — All commands and options
- [Configuration](configuration.md) — Customize settings
- [First Stylus Contract](guides/first-stylus-contract.md) — Build and deploy a contract
- [Troubleshooting](guides/troubleshooting.md) — Common issues and solutions
