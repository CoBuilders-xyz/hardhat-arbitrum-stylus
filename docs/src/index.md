# Hardhat Arbitrum Stylus Plugin

[![GitHub](https://img.shields.io/badge/GitHub-CoBuilders--xyz%2Fhardhat--arbitrum--stylus-blue?logo=github)](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus)
[![npm](https://img.shields.io/npm/v/@cobuilders/hardhat-arbitrum-stylus?logo=npm)](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus)

Hardhat plugin suite for Arbitrum Stylus development.

!!! tip "Alpha Status"

    The test plugin is still under development. See [Plugins](plugins/index.md) for current status.

## What's Included

`@cobuilders/hardhat-arbitrum-stylus` is a **plugin bundler** that includes all the individual plugins:

| Plugin                            | Description              | Status         |
| --------------------------------- | ------------------------ | -------------- |
| `@cobuilders/hardhat-arb-node`    | Run local Arbitrum node  | ✅ Available   |
| `@cobuilders/hardhat-arb-compile` | Compile Stylus contracts | ✅ Available   |
| `@cobuilders/hardhat-arb-deploy`  | Deploy contracts         | ✅ Available   |
| `@cobuilders/hardhat-arb-test`    | Test runner              | 🔜 Coming Soon |

## Prerequisites

| Tool          | Version | Installation                                         |
| ------------- | ------- | ---------------------------------------------------- |
| **Hardhat**   | **v3**  | Required (v2 not supported)                          |
| Node.js       | v22+    | [nodejs.org](https://nodejs.org) or `nvm install 22` |
| Docker        | Latest  | [docker.com](https://docker.com)                     |
| pnpm/npm/yarn | Latest  | Package manager                                      |

!!! warning "Hardhat 3 Required"

    This plugin uses Hardhat 3's plugin system. It is **not compatible** with Hardhat v2.

## Installation

You can add this plugin to an **existing Hardhat 3 project** or create a new one.

### New Hardhat Project

If starting from scratch we first need a hardhat project:

=== "npm"

    ```bash
    mkdir my-stylus-project && cd my-stylus-project
    npx hardhat --init
    ```

=== "yarn"

    ```bash
    mkdir my-stylus-project && cd my-stylus-project
    yarn dlx hardhat --init
    ```

=== "pnpm"

    ```bash
    mkdir my-stylus-project && cd my-stylus-project
    echo "auto-install-peers=true" >> .npmrc
    pnpm dlx hardhat --init
    ```
    !!! warning
        We set auto-install-peers to true. If you prefer to install peers manually ignore this line

        `echo "auto-install-peers=true" >> .npmrc`

Choose any template (Viem, Ethers, or minimal) - all work with this plugin.

Now that you have a Hardhat project, you can go to Install the Plugin section.

### Add to Existing Hardhat Project

If you already have a Hardhat 3 project, skip to installing the plugin.

### Install the Plugin

=== "npm"

    ```bash
    npm install @cobuilders/hardhat-arbitrum-stylus
    ```

    npm automatically installs peer dependencies.

=== "yarn"

    ```bash
    yarn add @cobuilders/hardhat-arbitrum-stylus
    ```

    yarn automatically installs peer dependencies.

=== "pnpm"

    ```bash
    pnpm add @cobuilders/hardhat-arbitrum-stylus
    ```
    pnpm does not install peer dependencies automatically. You may need to install them manually:

    ```bash
    pnpm add @cobuilders/hardhat-arb-node @cobuilders/hardhat-arb-compile \
             @cobuilders/hardhat-arb-deploy @cobuilders/hardhat-arb-test \
             @cobuilders/hardhat-arb-utils viem
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

## Next Steps

- [Node Plugin](plugins/node.md) - All commands and options
- [Configuration](configuration.md) - Customize settings
- [First Stylus Contract](guides/first-stylus-contract.md) - Build and deploy a contract
- [Troubleshooting](guides/troubleshooting.md) - Common issues and solutions
