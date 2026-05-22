# ThirdWeb Contracts

Integration tests for [thirdweb-example](https://github.com/thirdweb-example) Stylus contracts: token modules, airdrops, ZK minting, and BN254 helpers.

[:fontawesome-brands-github: View repo](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus-thirdweb-examples){ .md-button }

## Repository

|              |                                                                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Repo**     | [CoBuilders-xyz/hardhat-arbitrum-stylus-thirdweb-examples](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus-thirdweb-examples) |
| **Branch**   | `main`                                                                                                                                  |
| **Upstream** | Multiple repos under [thirdweb-example](https://github.com/thirdweb-example)                                                            |

## Why This Repo

ThirdWeb's Stylus examples each lived in a separate upstream repository. Rather than forking every repo individually, we created a single repo that **vendors** the upstream sources unchanged under `contracts/thirdweb/` and adds Hardhat integration tests on top.

## Contracts Tested (13 suites)

| Contract                      | Category                 |
| ----------------------------- | ------------------------ |
| `stylus-mintable-erc20`       | Mintable ERC-20 module   |
| `stylus-mintable-erc721`      | Mintable ERC-721 module  |
| `stylus-mintable-erc1155`     | Mintable ERC-1155 module |
| `stylus-transferable-erc20`   | Transferable ERC-20      |
| `stylus-transferable-erc721`  | Transferable ERC-721     |
| `stylus-transferable-erc1155` | Transferable ERC-1155    |
| `stylus-erc20`                | ERC-20 template          |
| `stylus-erc721`               | ERC-721 template         |
| `stylus-erc1155`              | ERC-1155 template        |
| `stylus-airdrop-erc20`        | ERC-20 airdrop           |
| `arkworks-bn254`              | BN254 precompile helper  |
| `stylus-zk-erc20`             | ZK mint ERC-20           |
| `stylus-zk-erc721`            | ZK mint ERC-721          |

### Not tested

| Contract                          | Reason                             |
| --------------------------------- | ---------------------------------- |
| `stylus-airdrop-erc1155-template` | Activation issues on Nitro devnode |

## Project Layout

```
contracts/thirdweb/     # vendored thirdweb-example sources (unchanged)
test/thirdweb/          # Hardhat integration tests + helpers.ts
hardhat.config.ts       # plugin + host toolchain config
```

## Plugin Configuration

```typescript
plugins: [hardhatToolboxViemPlugin, hardhatArbitrumStylusPlugin],

stylus: {
  node: { /* nitro-devnode on port 8547, chain ID 412346 */ },
  compile: { useHostToolchain: true },
  deploy: { useHostToolchain: true },
},
```

## How to Run

```bash
git clone https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus-thirdweb-examples.git
cd hardhat-arbitrum-stylus-thirdweb-examples

npm install
npm run compile:ci    # compile all contracts
npm run test:all      # run all 13 test suites sequentially
```

**Requirements:** Node 22+, Docker, Rust 1.87/1.88, `cargo-stylus`.

### Individual contract

```bash
npx hardhat arb:compile --stylus --host --contracts stylus-mintable-erc20
npx hardhat arb:deploy --host stylus-mintable-erc20
npx hardhat test test/thirdweb/stylus-mintable-erc20.test.ts
```

Or use the per-contract npm scripts:

```bash
npm run compile:stylus-mintable-erc20
npm run deploy:stylus-mintable-erc20
npm run test:stylus-mintable-erc20
```

## Test Helpers

`test/thirdweb/helpers.ts` provides shared utilities for ThirdWeb module semantics:

- `getModuleConfig()` module metadata
- Sale config encoding
- Install/uninstall bytes encoding
- Native token address

## Example Test Pattern

```typescript
const { stylusViem } = await network.create();
const contract = await stylusViem.deployContract('stylus-mintable-erc20');

// Module metadata
const config = await contract.read.getModuleConfig();
// Sale lifecycle, minter roles, mint price distribution...
```

Mintable module tests cover: `getModuleConfig()`, sale config, install/uninstall lifecycle, minter role checks, `distributeMintPrice()`, and `beforeMintERC20` authorization.
