# Node Plugin

The node plugin (`hardhat-arb-node`) manages local Arbitrum nitro-devnode containers. It provides CLI tasks, automatic node lifecycle via Hardhat hooks, temporary container management, and Stylus infrastructure deployment.

---

## Overview

The plugin has three main responsibilities:

- **CLI tasks** `arb:node start/stop/status/logs` for manual node management
- **Hook handlers** Config, HRE, and Network hooks for automatic node lifecycle
- **Temp node manager** Ephemeral containers with automatic cleanup on process exit

---

## Node Startup Flow

The `arb:node start` task performs the full setup:

1. **Port check** Verifies HTTP and WebSocket ports are available
2. **Container start** Pulls the image, creates and starts the container, then runs a readiness check (HTTP probe with 60s timeout)
3. **Essential setup** Calls `becomeChainOwner()` on ArbDebug precompile, then `setL1PricePerUnit(0)` on ArbOwner
4. **Prefund accounts** Sends 10 ETH to each of the 20 Hardhat accounts from the devAccount (#20)
5. **Stylus infrastructure** Deploys CREATE2 Factory, Cache Manager, and StylusDeployer
6. **Output** Prints accounts and connection info
7. **Attach or detach** Streams logs unless `--detach` is set

---

## Stylus Infrastructure

Every node start deploys three contracts needed for Stylus:

| Contract        | Address                                      | Purpose                           |
| --------------- | -------------------------------------------- | --------------------------------- |
| CREATE2 Factory | `0x4e59b44847b379578588920ca78fbf26c0b4956c` | Deterministic contract deployment |
| Cache Manager   | dynamic                                      | WASM caching for Stylus contracts |
| StylusDeployer  | `0xcEcba2F1DC234f70Dd89F2041029807F8D03A990` | Deployment helper (via CREATE2)   |

The CREATE2 Factory uses a pre-signed transaction (no private key needed). The Cache Manager is registered on the ArbOwner precompile via `addWasmCacheManager()`. The StylusDeployer is deployed via CREATE2 for a deterministic address.

---

## Hook System

The node plugin uses three hooks to integrate with Hardhat's lifecycle:

### Config Hook

1. **`extendUserConfig`** Injects a `default` network pointing to a random port (10000-60000). This port is unique per process, so CLI nodes and hook nodes never conflict.
2. **`resolveUserConfig`** Merges `stylus.node` user config with defaults.

### HRE Hook

Captures the `HardhatRuntimeEnvironment` on creation. The network hook needs this reference to call `arb:node start` programmatically.

### Network Hook

1. **`newConnection`** When connecting to the default network: checks if a temp container is already active, if the node is already running, or if it needs to start a new temp container.
2. **`closeConnection`** Cleans up any temp container created for the connection.
3. **`onRequest`** Intercepts `hardhat_getAutomine` and returns `true`. The nitro-devnode mines one block per transaction, so reporting it as automined prevents tools from waiting for multiple confirmations.

---

## Temp Node Manager

Manages ephemeral containers with automatic cleanup. Containers are named like `nitro-devnode-tmp-a1b2c3d4` and tracked in a set. Exit handlers (`SIGINT`, `SIGTERM`, `beforeExit`) ensure containers are cleaned up even on Ctrl+C.

This module is re-exported by the plugin and used by both the compile and deploy plugins for their ephemeral nodes.

---

## Port-State Management

Each process gets its own random HTTP port (10000-60000) for hook-managed nodes. This ensures no port conflicts between CLI nodes, hook nodes, and parallel test runs.

---

## Integration Points

- **`hardhat-arb-utils`** Provides `ContainerManager`, `DockerClient`, `createPluginError`, and viem wrappers
- **`hardhat-arb-compile`** and **`hardhat-arb-deploy`** Call `arb:node start` for temporary nodes and use the temp-node utilities for lifecycle management
