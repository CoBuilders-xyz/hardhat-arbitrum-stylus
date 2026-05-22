---
"@cobuilders/hardhat-arbitrum-stylus": major
"@cobuilders/hardhat-arb-node": major
"@cobuilders/hardhat-arb-compile": major
"@cobuilders/hardhat-arb-deploy": major
"@cobuilders/hardhat-arb-test": major
"@cobuilders/hardhat-arb-utils": major
---

# HH Arb Stylus v1.0.0-beta

## Hardhat Arbitrum Stylus — First Beta Release

This release marks the transition from alpha to **beta**. The focus was on validation, documentation, and stabilization — making sure the plugin works end-to-end with real-world contracts.

---

## What's Changed

### Real-World Validation with Example Repos

We forked and adapted three real Stylus projects to validate the plugin against actual contracts:

- **[Gnosis zkVM Verifiers](https://github.com/CoBuilders-xyz/stylus-zkvm-verifiers/tree/cobuilders/hardhat-test-suite)** — SP1 and Risc0 verifier contracts ported to Stylus, compiled and tested through the plugin
- **[OpenZeppelin Rust Contracts](https://github.com/CoBuilders-xyz/rust-contracts-stylus/tree/hardhat-plugin-examples)** — OpenZeppelin's `rust-contracts-stylus` library with ERC-20, ERC-721, and access control examples
- **[ThirdWeb Examples](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus-thirdweb-examples)** — ERC-20 and ERC-721 contracts from ThirdWeb's Stylus examples consolidated in one repo

### Documentation Overhaul (#81)

- Rewrote **Getting Started** with a complete quick-start cycle (`arb:node` → `arb:compile` → `arb:deploy` → `arb:test`)
- Rewrote **Your First Contract** guide using plugin tasks instead of raw `cargo stylus` commands
- Added **Real-World Examples** section documenting the Gnosis, OpenZeppelin, and ThirdWeb validation repos
- Added **Test Plugin** deep-dive for contributors
- Simplified contributor deep-dive sections for Node, Compile, and Deploy
- Fixed contributor dependency graph
- Re-enabled troubleshooting guide

### Multiple Contract Source Directories (#80)

- The plugin now discovers Stylus contracts from **all configured Hardhat source directories** (`hre.config.paths.sources.solidity`) instead of only the hardcoded `contracts/` folder
- Projects with multiple source roots are now supported

### Hardhat 3 API Update (#77)

- Migrated from deprecated `network.connect()` to `network.create()` across all plugins and documentation
- Updated Hardhat peer dependency versions

---

## 📦 Package Versions

| Package | Version | npm |
| --- | --- | --- |
| @cobuilders/hardhat-arbitrum-stylus | 1.0.0-beta.0 | [npm](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus) |
| @cobuilders/hardhat-arb-node | 1.0.0-beta.0 | [npm](https://www.npmjs.com/package/@cobuilders/hardhat-arb-node) |
| @cobuilders/hardhat-arb-compile | 1.0.0-beta.0 | [npm](https://www.npmjs.com/package/@cobuilders/hardhat-arb-compile) |
| @cobuilders/hardhat-arb-deploy | 1.0.0-beta.0 | [npm](https://www.npmjs.com/package/@cobuilders/hardhat-arb-deploy) |
| @cobuilders/hardhat-arb-test | 1.0.0-beta.0 | [npm](https://www.npmjs.com/package/@cobuilders/hardhat-arb-test) |
| @cobuilders/hardhat-arb-utils | 1.0.0-beta.0 | [npm](https://www.npmjs.com/package/@cobuilders/hardhat-arb-utils) |

## 🔗 Links

| Resource | Link |
| --- | --- |
| 📖 Documentation | https://cobuilders-xyz.github.io/hardhat-arbitrum-stylus/ |
| 🐙 GitHub Repository | https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus |
| 📦 npm (main package) | https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus |

## 🚀 Quick Start

```bash
mkdir my-stylus-project && cd my-stylus-project
npx @cobuilders/hardhat-arbitrum-stylus --init
```

```typescript
// hardhat.config.ts
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

```bash
npx hardhat arb:node start
npx hardhat arb:compile
npx hardhat arb:deploy stylus-counter
npx hardhat arb:test
```

## ✅ Current Status

| Plugin | Description | Status |
| --- | --- | --- |
| Node | Run local Arbitrum nitro-devnode | ✅ Available |
| Compile | Compile Stylus contracts | ✅ Available |
| Deploy | Deploy Stylus contracts | ✅ Available |
| Test | Test runner integration | ✅ Available |

---

Built by [CoBuilders](https://cobuilders.xyz)
