# Deploy Plugin

The deploy plugin (`hardhat-arb-deploy`) handles contract deployment. It supports both Solidity and Stylus contracts, manages ephemeral nodes, and provides the `stylusViem` network hook for programmatic deploys.

---

## Overview

The plugin has two main pieces:

- **`arb:deploy` task** CLI command for deploying a single contract (Solidity or Stylus), with ephemeral node management
- **Network hook (`stylusViem`)** Programmatic deploy API added to every `network.create()` call, used by tests and scripts

---

## Task Entry Point

The `arb:deploy` task branches on three dimensions:

1. **Contract type** Solidity (`.sol`) vs Stylus (folder name)
2. **Deployment mode** Host vs Docker (for Stylus only)
3. **Network** Ephemeral node vs external `--network`

The task handles all lifecycle management: starting/stopping ephemeral nodes, creating/removing Docker networks, and cleaning up on error.

---

## Solidity Deployment

1. **Find artifact** Recursively scans `artifacts/` for a JSON file matching the contract name
2. **Encode constructor args** Reads the ABI constructor, coerces string arguments to typed values (uint → BigInt, bool → true/false, etc.), and ABI-encodes them
3. **Deploy** Creates a viem wallet client, sends a deploy transaction, and waits for the receipt

---

## Stylus Deployment

Both host and Docker paths follow a similar flow:

1. **Discover** Uses `discoverStylusContractsFromSources()` to find the contract across all configured source directories
2. **Prepare** Validates toolchains (host) or ensures Docker image + volumes (Docker)
3. **Deploy** Runs `cargo stylus deploy` with the endpoint, private key, and constructor args
4. **Parse address** Extracts the contract address from cargo-stylus output

### Docker Networking

The container needs to reach the RPC endpoint. Three scenarios:

| Scenario               | How it works                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| Ephemeral node         | Container joins the Docker network; uses node container name as host |
| External localhost URL | `host.docker.internal` gateway; URL rewritten automatically          |
| External remote URL    | Passed directly to container                                         |

---

## Network Hook (stylusViem)

The deploy plugin's key programmatic API. The network hook adds `stylusViem` to every `network.create()` call, alongside the original `viem`.

When `stylusViem.deployContract()` is called:

- First tries Stylus deployment (discovers contract by name, exports ABI, runs `cargo stylus deploy`)
- If the contract is not found as a Stylus project, falls back to the original `viem.deployContract()` (Solidity path)

Both return the same viem contract instance with `.read`, `.write`, and `.getEvents`.

The hook also adds `stylusViem.assertions` which overrides revert-related assertion methods for Arbitrum node compatibility (since nitro-devnode doesn't preserve raw revert data the way EDR does).

---

## Network and Key Resolution

- **Ephemeral mode** (no `--network`) Uses `HARDHAT_ACCOUNTS[0].privateKey` (pre-funded on the temp node)
- **External mode** (`--network`) Reads `accounts[0]` from the network config. Only explicit private key arrays are supported (no HD wallets or remote accounts).

---

## Integration Points

- **`hardhat-arb-node`** Provides `arb:node start` for temporary nodes, plus temp-node lifecycle utilities, `generateRandomPort`, and `HARDHAT_ACCOUNTS`
- **`hardhat-arb-utils`** Provides `DockerClient`, `createPluginError`, URL rewriting (`isLocalhostUrl`/`toDockerHostUrl`), viem wrappers, and Stylus utilities (`discoverStylusContractsFromSources`, `ensureVolumes`, `ensureCompileImage`, `validateAllToolchains`)
