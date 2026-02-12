# Deploy Plugin

**Package:** `@cobuilders/hardhat-arb-deploy`

**Status:** ✅ Available

[:fontawesome-brands-github: Source](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages/hardhat-arb-deploy){ .md-button }
[:fontawesome-brands-npm: npm](https://www.npmjs.com/package/@cobuilders/hardhat-arb-deploy){ .md-button }

Deploys Solidity and Stylus (Rust) contracts to an Arbitrum network. Handles compilation, constructor arguments, and network management automatically - just point it at a contract and deploy.

## Two Deployment Modes

The plugin supports two ways to deploy Stylus contracts:

| Mode                 | Use Case                         | Requirements                         |
| -------------------- | -------------------------------- | ------------------------------------ |
| **Docker** (default) | Zero-setup, isolated deploys     | Docker only                          |
| **Host**             | Faster if Rust already installed | `rustup`, `cargo-stylus`, toolchains |

Docker mode runs deployment inside containers with cached volumes, so you don't need Rust installed locally. Host mode uses your system's Rust toolchain directly - faster when you already have the tools.

Solidity contracts always deploy directly, regardless of the mode.

---

## Command Reference

```bash
npx hardhat arb:deploy <contract> [constructorArgs...] [options]
```

| Argument / Option | Description                                                                                      | Default |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------- |
| `contract`        | Contract to deploy: `.sol` file (e.g. `MyContract.sol`) or Stylus folder (e.g. `stylus-counter`) | -       |
| `constructorArgs` | Constructor arguments in order (Foundry-style)                                                   | none    |
| `--host`          | Use host Rust toolchain instead of Docker                                                        | `false` |
| `--network`       | Target network from Hardhat config                                                               | default |

**Examples:**

```bash
npx hardhat arb:deploy MyContract.sol                      # Deploy Solidity contract
npx hardhat arb:deploy stylus-counter                      # Deploy Stylus contract (Docker)
npx hardhat arb:deploy stylus-counter --host               # Deploy Stylus contract (host)
npx hardhat arb:deploy MyContract.sol 42 "hello"           # With constructor args
npx hardhat arb:deploy stylus-counter arg1 arg2            # Stylus with constructor args
npx hardhat arb:deploy MyContract.sol --network arbitrum   # Deploy to external network
```

---

## What Happens When You Deploy

### Solidity Contracts

1. **Compile** - Runs `hardhat compile` to ensure artifacts are up to date
2. **Resolve artifact** - Finds the compiled artifact in `artifacts/`
3. **Encode** - Encodes constructor arguments (if any) and appends to bytecode
4. **Deploy** - Sends a deployment transaction and waits for the receipt
5. **Output** - Prints the contract address and transaction hash

### Stylus Contracts

1. **Discovery** - Finds the contract in `contracts/` by folder name
2. **Prepare** - Sets up Docker image and volumes (Docker mode) or validates toolchains (host mode)
3. **Node** - Starts a temporary Arbitrum node if no `--network` is specified
4. **Deploy** - Runs `cargo stylus deploy` against the target network
5. **Output** - Prints the deployed contract address
6. **Cleanup** - Stops the temporary node and removes temporary resources

!!! info "Temporary Node"

    When deploying without `--network`, the plugin automatically starts and stops a temporary Arbitrum node with Stylus infrastructure enabled. You don't need to manage this yourself.

---

## Networks

### Ephemeral Node (Default)

When you run `arb:deploy` without `--network`, the plugin starts a temporary Arbitrum node on random ports. The node includes full Stylus infrastructure and is automatically cleaned up after deployment.

```bash
# Uses a temporary node - no setup needed
npx hardhat arb:deploy stylus-counter
```

The deployer account is **Hardhat Account #0** (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`), pre-funded with 10 ETH on the ephemeral node.

### External Networks

Use `--network` to deploy to any HTTP network defined in your Hardhat config:

```bash
npx hardhat arb:deploy stylus-counter --network arbitrumSepolia
```

```typescript
// hardhat.config.ts
import { vars } from 'hardhat/config';

export default {
  networks: {
    arbitrumSepolia: {
      type: 'http',
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: [vars.get('DEPLOYER_KEY')],
    },
  },
};
```

The deployer account is `accounts[0]` from the network config. Only HTTP networks with explicit private keys are supported.

!!! warning "No HD Wallets or Remote Accounts"

    The deploy plugin requires explicit private keys in the `accounts` array. HD wallet configs and `"remote"` accounts are not supported.

---

## Constructor Arguments

Arguments are passed in order after the contract name, Foundry-style:

```bash
npx hardhat arb:deploy MyContract.sol 42 "hello world" 0x1234...
```

**For Solidity contracts**, the plugin reads the constructor ABI and coerces string arguments to the correct types:

| ABI Type          | Input           | Parsed As          |
| ----------------- | --------------- | ------------------ |
| `uint256`, `int*` | `"42"`          | `BigInt(42)`       |
| `bool`            | `"true"`, `"1"` | `true`             |
| `address`         | `"0x1234..."`   | pass-through       |
| `bytes*`          | `"0xab..."`     | pass-through (hex) |
| `string`          | `"hello"`       | pass-through       |

If you provide the wrong number of arguments, you'll get a clear error showing the expected constructor signature.

**For Stylus contracts**, arguments are passed directly to `cargo stylus deploy --constructor-args`.

---

## Docker Mode (Default)

Docker mode deploys Stylus contracts inside containers. This is the default and requires no local Rust installation.

**How it works:**

1. Reuses the compile image (`stylus-compile:latest`) - builds it from `rust:slim` with `cargo-stylus` if not cached
2. Uses Docker volumes for caching Rust toolchains and Cargo registry
3. Installs the contract-specific toolchain inside the container (cached after first use)
4. Creates a Docker network so the deploy container can reach the temporary node
5. Runs `cargo stylus deploy` in the container

**Docker networking:**

| Scenario               | How the container reaches the node            |
| ---------------------- | --------------------------------------------- |
| Ephemeral node         | Docker network - container uses node hostname |
| External localhost URL | `host.docker.internal` - mapped automatically |
| External remote URL    | Direct connection - no special handling       |

!!! tip "Shared Cache with Compile"

    The deploy plugin shares Docker volumes (`stylus-compile-rustup`, `stylus-compile-cargo`) with the compile plugin. If you've already compiled, toolchains and dependencies are cached - deployment is fast.

---

## Host Mode

Use `--host` or set `useHostToolchain: true` in config to deploy with your system's Rust toolchain.

```bash
npx hardhat arb:deploy stylus-counter --host
```

The plugin validates all requirements before starting:

1. `rustup` is installed
2. `cargo-stylus` is installed
3. The required toolchain version is installed
4. The `wasm32-unknown-unknown` target is installed for the toolchain

If anything is missing, you'll get clear instructions on what to install.

!!! note "Host Mode Prerequisites"

    Install the required tools before using host mode:

    ```bash
    # Install rustup (if not already installed)
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

    # Install cargo-stylus
    cargo install cargo-stylus

    # For each toolchain version your contracts use:
    rustup install 1.93.0
    rustup +1.93.0 target add wasm32-unknown-unknown
    ```

---

## Configuration

```typescript
export default {
  stylus: {
    deploy: {
      useHostToolchain: false, // Set to true to always use host Rust
    },
  },
};
```

| Option             | Type    | Default | Description                               |
| ------------------ | ------- | ------- | ----------------------------------------- |
| `useHostToolchain` | boolean | `false` | Use host Rust toolchain instead of Docker |

The `--host` CLI flag overrides this setting for a single run.

See [Configuration](../configuration.md) for all options.
