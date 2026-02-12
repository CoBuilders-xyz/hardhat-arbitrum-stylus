# @cobuilders/hardhat-arb-test

## 0.0.1-alpha.14

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
