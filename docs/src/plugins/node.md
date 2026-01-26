# Node Plugin

**Package:** `@cobuilders/hardhat-arb-node`

**Status:** ✅ Available

Manages a local Arbitrum nitro-devnode for development.

## Installation

Included in the toolbox, or install standalone:

```bash
npm install @cobuilders/hardhat-arb-node
```

## Commands

### `arb:node start`

```bash
npx hardhat arb:node start [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--quiet` | Suppress output | false |
| `--detach`, `-d` | Run in background | false |
| `--stylus-ready` | Deploy Stylus infrastructure | false |
| `--name` | Container name | `nitro-devnode` |
| `--http-port` | HTTP port | `8547` |
| `--ws-port` | WebSocket port | `8548` |

**Examples:**

```bash
npx hardhat arb:node start                    # Foreground
npx hardhat arb:node start --detach           # Background
npx hardhat arb:node start --stylus-ready     # With Stylus support
npx hardhat arb:node start --http-port 9545   # Custom port
```

### `arb:node stop`

```bash
npx hardhat arb:node stop [--name <name>]
```

### `arb:node status`

```bash
npx hardhat arb:node status [--name <name>]
```

### `arb:node logs`

```bash
npx hardhat arb:node logs [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--follow`, `-f` | Follow output | false |
| `--tail`, `-n` | Lines to show | `50` |
| `--name` | Container name | `nitro-devnode` |

## Pre-funded Accounts

20 Hardhat accounts with 10 ETH each:

| # | Address | Private Key |
|---|---------|-------------|
| 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| ... | ... | ... |

Plus Account #20 (Chain Owner) with ~800 ETH.

!!! warning
    These are public keys. Never use on mainnet.

## Stylus-Ready Mode

`--stylus-ready` deploys:

- **CREATE2 Factory** — Deterministic deployment
- **Cache Manager** — WASM caching
- **StylusDeployer** — Deployment helper

## Configuration

```typescript
export default {
  arbNode: {
    image: 'offchainlabs/nitro-node',
    tag: 'v3.7.1-926f1ab',
    httpPort: 8547,
    wsPort: 8548,
    chainId: 412346,
  },
};
```

See [Configuration](../configuration.md) for all options.
