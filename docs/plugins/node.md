# Node Plugin

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page documents the hardhat-arb-node plugin - the LOCAL NODE MANAGEMENT plugin.
THIS PLUGIN IS FULLY IMPLEMENTED - provide comprehensive documentation.

WHAT TO WRITE:
- Complete documentation of all tasks and options
- Detailed explanation of each command
- Configuration options
- Pre-funded accounts information
- Stylus-ready mode explanation
- Examples and use cases

SECTIONS TO INCLUDE:

1. Overview
   - What the plugin does
   - Why you need a local node
   - Docker-based architecture

2. Installation (standalone)
   - npm install command
   - Config setup

3. Tasks Reference
   - arb:node start (with all flags and options)
   - arb:node stop
   - arb:node status  
   - arb:node logs (with all flags and options)

4. Pre-funded Accounts
   - List of 20 Hardhat accounts + chain owner
   - How to use them
   - Security warning about private keys

5. Stylus-Ready Mode
   - What --stylus-ready does
   - Deployed contracts (CREATE2, Cache Manager, StylusDeployer)

6. Configuration Options
   - All arbNode config options
   - Defaults
   - Examples

7. Docker Container Details
   - Image used (nitro-devnode)
   - Ports exposed
   - Container naming

REFERENCE MATERIALS:
- packages/hardhat-arb-node/src/index.ts (task definitions)
- packages/hardhat-arb-node/src/tasks/start.ts (start implementation)
- packages/hardhat-arb-node/src/tasks/stop.ts
- packages/hardhat-arb-node/src/tasks/status.ts
- packages/hardhat-arb-node/src/tasks/logs.ts
- packages/hardhat-arb-node/src/config/types.ts (config types)
- packages/hardhat-arb-node/src/config/defaults.ts (default values)

KEY IMPLEMENTATION DETAILS FROM SOURCE:
- Default ports: HTTP 8547, WS 8548
- Chain ID: 412346
- Docker image: offchainlabs/nitro-node:v3.7.1-926f1ab
- Container name: nitro-devnode
- 20 Hardhat accounts pre-funded with 10 ETH each
- Chain owner account #20 with ~800 ETH

TASK FLAGS FROM index.ts:
arb:node start:
  --quiet: Suppress output
  --detach, -d: Run in background
  --stylus-ready: Deploy Stylus infrastructure
  --name: Custom container name
  --http-port: Custom HTTP port
  --ws-port: Custom WebSocket port

arb:node stop:
  --quiet: Suppress output
  --name: Container name

arb:node status:
  --name: Container name

arb:node logs:
  --follow, -f: Follow log output
  --tail, -n: Number of lines (default: 50)
  --name: Container name

=============================================================================
-->

**Package:** `@cobuilders/hardhat-arb-node`

**Status:** ✅ Available

The Node plugin manages a local Arbitrum nitro-devnode for development and testing.

## Overview

<!-- 
Explain:
- Runs Arbitrum nitro-devnode in Docker
- Provides a local L2 environment
- Pre-funded accounts for development
- Optional Stylus infrastructure deployment
-->

## Installation

If using the [toolbox](toolbox.md), this plugin is included automatically.

For standalone installation:

```bash
npm install @cobuilders/hardhat-arb-node
```

```typescript
import hardhatArbNode from '@cobuilders/hardhat-arb-node';

export default {
  plugins: [hardhatArbNode],
};
```

## Tasks

### `arb:node start`

Start the local Arbitrum node.

```bash
npx hardhat arb:node start [options]
```

#### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--quiet` | | Suppress output | `false` |
| `--detach` | `-d` | Run in background without attaching to logs | `false` |
| `--stylus-ready` | | Deploy CREATE2 factory, Cache Manager, and StylusDeployer | `false` |
| `--name` | | Custom container name | `nitro-devnode` |
| `--http-port` | | Custom HTTP RPC port | `8547` |
| `--ws-port` | | Custom WebSocket port | `8548` |

#### Examples

```bash
# Start with default settings (foreground)
npx hardhat arb:node start

# Start in background
npx hardhat arb:node start --detach

# Start with Stylus support
npx hardhat arb:node start --stylus-ready

# Start with custom ports
npx hardhat arb:node start --http-port 9545 --ws-port 9546

# Start multiple nodes with different names
npx hardhat arb:node start --name my-node-1 --http-port 8547
npx hardhat arb:node start --name my-node-2 --http-port 8549
```

### `arb:node stop`

Stop the running node.

```bash
npx hardhat arb:node stop [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--quiet` | Suppress output | `false` |
| `--name` | Container name to stop | `nitro-devnode` |

### `arb:node status`

Check if the node is running.

```bash
npx hardhat arb:node status [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name` | Container name to check | `nitro-devnode` |

### `arb:node logs`

View node logs.

```bash
npx hardhat arb:node logs [options]
```

#### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--follow` | `-f` | Follow log output (like `tail -f`) | `false` |
| `--tail` | `-n` | Number of lines to show from end | `50` |
| `--name` | | Container name | `nitro-devnode` |

#### Examples

```bash
# Show last 50 lines
npx hardhat arb:node logs

# Follow logs in real-time
npx hardhat arb:node logs --follow

# Show last 100 lines
npx hardhat arb:node logs --tail 100
```

## Pre-funded Accounts

The node comes with 21 pre-funded accounts:

### Accounts #0-19 (Hardhat Default Accounts)

Each account has **10 ETH**. These match Hardhat's standard development accounts.

<!-- 
Include the first few accounts as examples:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
-->

| Account | Address | Private Key |
|---------|---------|-------------|
| #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| ... | ... | ... |

→ See full list in startup output

### Account #20 (Chain Owner)

- **Address:** `0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E`
- **Balance:** ~800 ETH
- **Special:** Has ArbOwner privileges (L2 chain owner)

!!! warning "Security Notice"
    These private keys are publicly known. **NEVER** use these accounts on mainnet or send real funds to them.

## Stylus-Ready Mode

The `--stylus-ready` flag deploys infrastructure required for Stylus contract deployment:

<!-- 
Explain what each contract does:
- CREATE2 Factory: Deterministic deployment
- Cache Manager: WASM caching for Stylus
- StylusDeployer: Helper for deploying Stylus contracts
-->

| Contract | Purpose |
|----------|---------|
| CREATE2 Factory | Enables deterministic contract deployment |
| Cache Manager | Manages WASM caching for Stylus contracts |
| StylusDeployer | Helper contract for Stylus deployment |

## Configuration

Configure the node in `hardhat.config.ts`:

```typescript
export default {
  arbNode: {
    // Docker image (default: "offchainlabs/nitro-node")
    image: 'offchainlabs/nitro-node',
    
    // Image tag (default: "v3.7.1-926f1ab")
    tag: 'v3.7.1-926f1ab',
    
    // HTTP RPC port (default: 8547)
    httpPort: 8547,
    
    // WebSocket port (default: 8548)
    wsPort: 8548,
    
    // Chain ID (default: 412346)
    chainId: 412346,
  },
};
```

→ [Full Node Configuration Reference](../configuration/node-config.md)

## Docker Container

<!-- 
Technical details:
- Image: offchainlabs/nitro-node
- Auto-removed on stop (--rm)
- Ports mapped to host
- How to troubleshoot Docker issues
-->

The plugin runs [nitro-devnode](https://github.com/OffchainLabs/nitro-devnode) in a Docker container:

- **Image:** `offchainlabs/nitro-node`
- **Container Name:** `nitro-devnode` (configurable)
- **Ports:** HTTP 8547, WebSocket 8548 (configurable)
- **Auto-remove:** Container is removed when stopped

### Requirements

- Docker must be running
- Ports must be available
- Sufficient memory (~4GB recommended)

## Troubleshooting

<!-- 
Common issues:
- Port already in use
- Docker not running
- Container already exists
- Permission issues
-->

### Port Already in Use

```
Error: HTTP port 8547 is already in use
```

Solution: Use `--http-port` to specify a different port, or stop the existing process.

### Docker Not Available

```
Error: Docker is not available. Please ensure Docker is installed and running.
```

Solution: Start Docker Desktop or the Docker daemon.
