---
'@cobuilders/hardhat-arbitrum-stylus': patch
'@cobuilders/hardhat-arb-compile': patch
'@cobuilders/hardhat-arb-deploy': patch
'@cobuilders/hardhat-arb-node': patch
'@cobuilders/hardhat-arb-test': patch
'@cobuilders/hardhat-arb-utils': patch
---

Release notes since `dcec6db` (last release commit):

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
