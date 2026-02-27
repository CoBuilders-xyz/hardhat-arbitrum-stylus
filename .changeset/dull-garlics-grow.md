---
'@cobuilders/hardhat-arbitrum-stylus': patch
'@cobuilders/hardhat-arb-compile': patch
'@cobuilders/hardhat-arb-deploy': patch
'@cobuilders/hardhat-arb-utils': patch
'@cobuilders/hardhat-arb-node': patch
'@cobuilders/hardhat-arb-test': patch
---

feat: ship deploy/test plugins, toolbox init CLI, and Stylus plugin architecture refactor

- implement hardhat-arb-deploy end-to-end, including wasm/solidity deployers, network/config hooks, and Stylus assertion support
- add hardhat-arb-test plugin runner with host/container execution paths, runtime env handling, and expanded task-level/unit coverage
- introduce toolbox init CLI scaffolding in hardhat-arbitrum-stylus for bootstrapping Stylus projects safely
- reorganize plugin internals across compile/deploy/node/test into plugin/, services/, and state/ modules for clearer boundaries and maintainability
- extract and expand shared functionality in hardhat-arb-utils (config hooks/resolver, exec helpers, stylus docker commands, ABI parsing/export, discovery/cache improvements)
- improve performance and reliability of Stylus discovery/container command flows and compatibility of cross-VM/node test assertions
- add substantial cross-VM, deploy, and plugin E2E/unit tests (including stylus proxy fixture coverage)
- update deep-dive and plugin docs to reflect new package layout, workflows, and testing/deployment behavior
