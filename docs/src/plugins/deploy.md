# Deploy Plugin

**Package:** `@cobuilders/hardhat-arb-deploy`

**Status:** 🔜 Coming Soon

!!! warning "Coming Soon"
    This plugin is under development.

## Planned Features

- Deploy Stylus contracts
- Deploy Solidity contracts
- Deployment tracking

## Current Workaround

Deploy manually with cargo-stylus:

```bash
cargo stylus deploy \
  --endpoint http://localhost:8547 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
