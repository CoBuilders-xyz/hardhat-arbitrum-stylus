# @cobuilders/hardhat-arb-utils

## 0.0.1-alpha.17

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

## 0.0.1-alpha.16

### Patch Changes

- 8a7b4f7: Added Container Compile Feature

## 0.0.1-alpha.15

### Patch Changes

- e1cf6d8: add web3 utilities and refactor transaction handling
- e9ef916: add 'persist' flag to node start task for container mgmt
- 12f59ed: Default network hook spins up arb devnode

## 0.0.1-alpha.14

### Patch Changes

- 4043e74: Fix workspace publishing for npm

## 0.0.1-alpha.13

### Patch Changes

- f314e72: Added hardhat-arb-node to plugin suite
  - start|stop|status|logs
  - prefunded accounts Enhanced all packages error handling (HardhatPluginError)
- e567a7e: feat: add hardhat-arb-utils package with Docker container management utilities
