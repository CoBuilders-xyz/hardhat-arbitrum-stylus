# Hardhat Arbitrum Stylus Plugin

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This is the home page, merged with getting started content.

WHAT TO WRITE:
- Brief introduction to Hardhat Arbitrum Stylus Plugin
- What's included (plugin table with status)
- Prerequisites
- Installation steps
- Quick start (start node, verify)
- Links to next steps

TONE:
- Concise, action-oriented
- Get users running quickly
- No fluff

SECTIONS:
1. Brief intro (1-2 sentences)
2. What's included table
3. Prerequisites (short list)
4. Installation (3 steps)
5. Quick Start (start node, verify)
6. Next Steps links

REFERENCE MATERIALS:
- Package README files
- Plugin package.json for versions
- Hardhat 3 getting started docs

=============================================================================
-->

Hardhat plugin suite for Arbitrum Stylus development.

!!! tip "Beta Status"
    Some features are coming soon. See [Plugins](plugins/index.md) for current status.

## What's Included

| Plugin | Description | Status |
|--------|-------------|--------|
| `@cobuilders/hardhat-arb-node` | Run local Arbitrum node | ✅ Available |
| `@cobuilders/hardhat-arb-compile` | Compile Stylus contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-deploy` | Deploy contracts | 🔜 Coming Soon |
| `@cobuilders/hardhat-arb-test` | Test runner | 🔜 Coming Soon |

## Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | v22+ | [nodejs.org](https://nodejs.org) or `nvm install 22` |
| Docker | Latest | [docker.com](https://docker.com) |
| pnpm | v8+ | `npm install -g pnpm` |

For Stylus contracts, also install Rust and cargo-stylus.

## Installation

**1. Install the plugin:**

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

**2. Configure Hardhat:**

```typescript
// hardhat.config.ts
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
};

export default config;
```

**3. Verify:**

```bash
npx hardhat --help
# Should show arb:node commands
```

## Quick Start

```bash
npx hardhat arb:node start
```

You'll see pre-funded accounts and the RPC endpoint:

```
Started HTTP Server at http://localhost:8547/
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10 ETH)
...
```

For Stylus contract deployment, add `--stylus-ready`:

```bash
npx hardhat arb:node start --stylus-ready
```

## Next Steps

- [Node Plugin](plugins/node.md) — All commands and options
- [Configuration](configuration.md) — Customize settings
- [First Stylus Contract](guides/first-stylus-contract.md) — Build and deploy a contract
