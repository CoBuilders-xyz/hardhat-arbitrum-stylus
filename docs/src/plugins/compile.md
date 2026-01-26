# Compile Plugin

**Package:** `@cobuilders/hardhat-arb-compile`

**Status:** 🔜 Coming Soon

!!! warning "Coming Soon"
    This plugin is under development.

## Planned Features

- Compile Stylus contracts via `cargo-stylus`
- Compile Solidity contracts
- Unified artifact generation

## Current Workaround

Compile manually with cargo-stylus:

```bash
cd contracts/stylus/my-contract
cargo stylus check --endpoint http://localhost:8547
cargo build --release --target wasm32-unknown-unknown
```
