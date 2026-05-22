# Compile Plugin

The compile plugin (`hardhat-arb-compile`) handles Stylus contract compilation. It discovers Rust contracts, compiles them via `cargo-stylus`, and generates Hardhat-compatible artifacts.

---

## Overview

The `arb:compile` task orchestrates: discovery of Stylus contracts, toolchain validation (host) or Docker image preparation (container), starting a temp node for `cargo stylus check`, running compilation, generating Hardhat-compatible artifacts, and cleanup.

---

## Discovery

`discoverStylusContractsFromSources()` scans all configured Hardhat source directories (`hre.config.paths.sources.solidity`):

1. For each source directory, recursively finds directories with `Cargo.toml` (skips `target/` and hidden dirs)
2. Parses `Cargo.toml` with `smol-toml` checks if `stylus-sdk` is in dependencies
3. Reads `rust-toolchain.toml` to get the required Rust version
4. Deduplicates by contract name across source directories
5. Optionally filters by contract name (from `--contracts` flag)

Non-Stylus Cargo projects are silently skipped. Missing `rust-toolchain.toml` throws an error.

---

## Host Compilation

When `--host` is used:

1. **Validate toolchains** Checks `rustup`, `cargo-stylus`, required toolchains, and `wasm32-unknown-unknown` targets upfront
2. **Start temp node** Calls `arb:node start` with `detach: true` and random ports
3. **For each contract** Runs `cargo +{toolchain} stylus check`, then `cargo +{toolchain} stylus build`
4. **Generate artifact** Exports ABI and reads WASM
5. **Cleanup** Stops the temporary node

---

## Docker Compilation

When using Docker (the default):

1. **Ensure volumes** Creates `stylus-compile-rustup` and `stylus-compile-cargo` Docker volumes for caching
2. **Build image** Builds `stylus-compile:latest` from `rust:slim` with `cargo-stylus` (only once, cached)
3. **Create network** A temporary Docker network lets the compile container reach the node container by hostname
4. **Start temp node** Same as host mode, but attached to the Docker network
5. **For each contract** Installs toolchain in container (cached in volumes), runs `cargo stylus check` and `cargo stylus build`
6. **Generate artifact** Exports ABI and reads WASM
7. **Cleanup** Stops node, removes Docker network

---

## Artifact Generation

After successful compilation:

1. **ABI export** Runs `cargo stylus export-abi` to get a Solidity interface
2. **Parse ABI** Converts the Solidity interface to JSON ABI format
3. **Read WASM** Reads the compiled `.wasm` file and converts to hex
4. **Save** Writes `artifacts/contracts/{name}/{name}.json` with format `hh3-stylus-artifact-1`

Artifact generation is best-effort if ABI export fails, the artifact still gets an empty ABI.

---

## Integration Points

- **`hardhat-arb-node`** Provides `arb:node start` for temporary nodes, plus temp-node lifecycle utilities
- **`hardhat-arb-utils`** Provides `DockerClient` for Docker operations, `createPluginError` for error handling, and Stylus utilities (`discoverStylusContractsFromSources`, `ensureVolumes`, `ensureCompileImage`, `validateAllToolchains`)
