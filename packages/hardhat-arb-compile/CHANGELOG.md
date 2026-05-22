# @cobuilders/hardhat-arb-compile

## 1.0.0-beta.17

### Major Changes

- c0e5a7d: # HH Arb Stylus v1.0.0-beta

  ## Hardhat Arbitrum Stylus — First Beta Release

  This release marks the transition from alpha to **beta**. The focus was on validation, documentation, and stabilization — making sure the plugin works end-to-end with real-world contracts.

  ***

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

  ***

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

  | Plugin  | Description                      | Status       |
  | ------- | -------------------------------- | ------------ |
  | Node    | Run local Arbitrum nitro-devnode | ✅ Available |
  | Compile | Compile Stylus contracts         | ✅ Available |
  | Deploy  | Deploy Stylus contracts          | ✅ Available |
  | Test    | Test runner integration          | ✅ Available |

  ***

  Built by [CoBuilders](https://cobuilders.xyz)

### Patch Changes

- Updated dependencies [c0e5a7d]
  - @cobuilders/hardhat-arb-node@1.0.0-beta.21
  - @cobuilders/hardhat-arb-utils@1.0.0-beta.20

## 0.0.1-alpha.16

### Patch Changes

- f7dd98f: feat: ship deploy/test plugins, toolbox init CLI, and Stylus plugin architecture refactor
  - implement hardhat-arb-deploy end-to-end, including wasm/solidity deployers, network/config hooks, and Stylus assertion support
  - add hardhat-arb-test plugin runner with host/container execution paths, runtime env handling, and expanded task-level/unit coverage
  - introduce toolbox init CLI scaffolding in hardhat-arbitrum-stylus for bootstrapping Stylus projects safely
  - reorganize plugin internals across compile/deploy/node/test into plugin/, services/, and state/ modules for clearer boundaries and maintainability
  - extract and expand shared functionality in hardhat-arb-utils (config hooks/resolver, exec helpers, stylus docker commands, ABI parsing/export, discovery/cache improvements)
  - improve performance and reliability of Stylus discovery/container command flows and compatibility of cross-VM/node test assertions
  - add substantial cross-VM, deploy, and plugin E2E/unit tests (including stylus proxy fixture coverage)
  - update deep-dive and plugin docs to reflect new package layout, workflows, and testing/deployment behavior

- f7dd98f: Release notes since `dcec6db` (last release commit):
  - Added full Stylus deployment workflow in `@cobuilders/hardhat-arb-deploy`:
    - `arb:deploy` task for Solidity and Stylus contracts
    - host and Docker deployers
    - external network support with private key resolution
    - constructor argument forwarding
    - `stylusViem` integration and Stylus-aware assertions for nitro-devnode compatibility
  - Expanded test capabilities in `@cobuilders/hardhat-arb-test` and toolbox fixtures:
    - `arb:test` task flow for host and container modes
    - cross-VM and deployment E2E coverage
    - compatibility handling for custom errors/revert assertions on local Arbitrum nodes
  - Improved shared infrastructure in `@cobuilders/hardhat-arb-utils`:
    - new `config` helpers for plugin config hooks and sub-config resolution
    - extracted `exec` utilities
    - shared ephemeral-node task helpers
    - improved Stylus ABI/container utility surface
  - Optimized containerized compile/deploy paths across `@cobuilders/hardhat-arb-utils`, `@cobuilders/hardhat-arb-compile`, and `@cobuilders/hardhat-arb-deploy`:
    - cached Stylus contract discovery results with explicit refresh support
    - de-duplicated per-toolchain container setup (rustup + wasm target) within runs
    - consolidated Stylus container command execution/error handling
    - indexed Solidity artifact lookup to reduce repeated JSON parsing cost
    - improved streaming progress parsing in command and Docker execution helpers
  - Refined plugin internals in `@cobuilders/hardhat-arb-node` and `@cobuilders/hardhat-arb-compile`:
    - clearer config/runtime wiring
    - updated compile/deploy integration touchpoints
  - Performed repository-wide source organization refactor (no logic changes):
    - standardized internal layout to `plugin/`, `services/`, and `state/`
    - preserved stable root entrypoints with compatibility wrappers
  - Updated contributor and plugin documentation to match the current architecture and workflows.

- Updated dependencies [f7dd98f]
- Updated dependencies [f7dd98f]
  - @cobuilders/hardhat-arb-utils@0.0.1-alpha.18
  - @cobuilders/hardhat-arb-node@0.0.1-alpha.20

## 0.0.1-alpha.15

### Patch Changes

- 0a72a9c: feat: implement hardhat-arb-deploy plugin

  ### hardhat-arb-deploy
  - Deploy task (arb:deploy) for Solidity and Stylus (WASM) contracts
  - Solidity deployer with artifact discovery and constructor arg encoding
  - Stylus WASM host deployer via local cargo-stylus
  - Stylus WASM container deployer via Docker with volume-cached toolchains
  - Ephemeral node lifecycle — auto-starts temp Arbitrum node, deploys, cleans up
  - External network support via --network flag with private key resolution
  - Constructor arguments support (Foundry-style variadic args)
  - Docker network orchestration for container-to-node communication
  - Configuration: stylus.deploy.useHostToolchain with config hook
  - Unit tests: config, artifact discovery, deploy output parsing, container deploy

  ### hardhat-arb-node
  - Always deploy Stylus infrastructure on node start (removed --stylus-ready flag)
  - Extracted chain-infra, chain-setup, startup-info utilities
  - New exports: generateRandomPort, HARDHAT_ACCOUNTS

  ### hardhat-arb-utils
  - New task-helpers module: resolveExternalRpcUrl, generateNetworkName, writeProgress
  - New stylus module: shared discovery, toolchain validation, Docker image/volume helpers
  - Docker client: volume management, network utilities (isLocalhostUrl, toDockerHostUrl)
  - Updated StylusDeployer bytecode to canonical CREATE2 address

  ### hardhat-arb-compile
  - Renamed local.ts to host.ts (useHostToolchain naming alignment)
  - New ABI parser tests
  - Test files renamed to .test.ts convention

  ### Documentation
  - New deploy and node deep-dive docs
  - Updated plugin docs, configuration, and contributor guides

- 0d95dae: Enhanced configuration object structure
- Updated dependencies [0a72a9c]
- Updated dependencies [0d95dae]
  - @cobuilders/hardhat-arb-utils@0.0.1-alpha.17
  - @cobuilders/hardhat-arb-node@0.0.1-alpha.19

## 0.0.1-alpha.14

### Patch Changes

- 8a7b4f7: Added Container Compile Feature
- cd35110: implement contract discovery utilities for Stylus projects
- Updated dependencies [8a7b4f7]
  - @cobuilders/hardhat-arb-utils@0.0.1-alpha.16
  - @cobuilders/hardhat-arb-node@0.0.1-alpha.18

## 0.0.1-alpha.13

### Patch Changes

- 4043e74: Fix workspace publishing for npm

## 0.0.1-alpha.12

### Patch Changes

- a8c712c: Added readme badges and keywords

## 0.0.1-alpha.11

### Patch Changes

- dd40dbf: Add release and pre-release to gh

## 0.0.1-alpha.10

### Patch Changes

- 61f2d49: Added auto-tag workflow

## 0.0.1-alpha.9

### Patch Changes

- b3fbeaa: Add tag to npm publish

## 0.0.1-alpha.8

### Patch Changes

- 20cd0e8: Fix release.yml: publish with npm

## 0.0.1-alpha.7

### Patch Changes

- 2d39409: Make public package

## 0.0.1-alpha.6

### Patch Changes

- 580c909: Fix package.json org case

## 0.0.1-alpha.5

### Patch Changes

- c88edca: OIDC Fix

## 0.0.1-alpha.4

### Patch Changes

- 7843b4f: Fix OIDC release

## 0.0.1-alpha.3

### Patch Changes

- 47932a3: Added provenance flag to force OIDC

## 0.0.1-alpha.2

### Patch Changes

- 1f828e6: Replaced npm token for trusted publisher

## 0.0.1-alpha.1

### Patch Changes

- 68c2ba4: Alpha release owner rectification

## 0.0.1-alpha.0

### Patch Changes

- 4f1b8aa: Bumping version for alpha release
