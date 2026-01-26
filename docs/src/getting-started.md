# Getting Started

<!-- 
CONTENT DESCRIPTION:
Complete getting started guide combining prerequisites, installation, and quick start.
Should get users from zero to running local node in one page.

SECTIONS:
1. Prerequisites (Node.js v22+, Docker, pnpm)
2. Installation (npm install, config setup)
3. Quick Start (start node, verify, interact)
4. Next Steps
-->

Get up and running with Hardhat Arbitrum Stylus in minutes.

## Prerequisites

Before you begin, install:

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | v22+ | [nodejs.org](https://nodejs.org) or `nvm install 22` |
| Docker | Latest | [docker.com](https://docker.com) |
| pnpm | v8+ | `npm install -g pnpm` |

For Stylus contract development, also install:

| Tool | Purpose | Installation |
|------|---------|--------------|
| Rust | Stylus contracts | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| WASM target | Compilation | `rustup target add wasm32-unknown-unknown` |
| cargo-stylus | Stylus CLI | `cargo install cargo-stylus` |

### Verify Installation

```bash
node --version      # v22.x.x+
docker --version    # Docker version 24+
pnpm --version      # 8.x.x+
```

## Installation

### 1. Create Project

```bash
mkdir my-stylus-project && cd my-stylus-project
pnpm init
```

### 2. Install Dependencies

```bash
pnpm add hardhat @cobuilders/hardhat-arbitrum-stylus
pnpm add -D typescript @types/node
```

### 3. Configure Hardhat

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

## Quick Start

### Start Local Node

```bash
npx hardhat arb:node start
```

You'll see:

```
Started HTTP Server at http://localhost:8547/
Started WebSocket Server at ws://localhost:8548

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

20 accounts are pre-funded with 10 ETH each (same as Hardhat's default accounts).

### Verify Node

```bash
curl -X POST http://localhost:8547 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Response: `{"jsonrpc":"2.0","id":1,"result":"0x64a7a"}` (Chain ID: 412346)

### Run in Background

```bash
npx hardhat arb:node start --detach
npx hardhat arb:node status
npx hardhat arb:node logs --follow
npx hardhat arb:node stop
```

### Enable Stylus Support

For deploying Stylus contracts:

```bash
npx hardhat arb:node start --stylus-ready
```

This deploys CREATE2 factory, Cache Manager, and StylusDeployer.

## Next Steps

- [Node Plugin Reference](plugins/node.md) — All commands and options
- [Configuration](configuration.md) — Customize ports, images
- [Local Development Guide](guides/local-development.md) — Development workflow
- [Tutorial](tutorial.md) — Build your first Stylus contract
