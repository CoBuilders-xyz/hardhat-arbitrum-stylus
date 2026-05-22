# OpenZeppelin Contracts

Integration tests for [OpenZeppelin's rust-contracts-stylus](https://github.com/OpenZeppelin/rust-contracts-stylus) the standard library for Stylus smart contracts in Rust.

[:fontawesome-brands-github: View repo](https://github.com/CoBuilders-xyz/rust-contracts-stylus/tree/hardhat-plugin-examples){ .md-button }

## Repository

|                        |                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **Fork**               | [CoBuilders-xyz/rust-contracts-stylus](https://github.com/CoBuilders-xyz/rust-contracts-stylus) |
| **Branch**             | `hardhat-plugin-examples`                                                                       |
| **Upstream**           | [OpenZeppelin/rust-contracts-stylus](https://github.com/OpenZeppelin/rust-contracts-stylus)     |
| **Hardhat subproject** | `hardhat-examples/`                                                                             |

## Why This Repo

OpenZeppelin's Stylus library ships 34 example contracts covering every major token standard and pattern. Testing 22 of them against the plugin proves it handles the contract types developers reach for first: ERC tokens, access control, proxies, and cryptographic primitives.

## Contracts Tested (22 suites)

| Category   | Contracts                                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tokens** | `erc20-example`, `erc20-permit-example`, `erc721-example`, `erc721-consecutive-example`, `erc1155-example`, `erc1155-metadata-uri-example`, `erc1155-supply-example`, `erc6909-example`, `erc6909-supply-example` |
| **Access** | `access-control-example`, `ownable-example`                                                                                                                                                                       |
| **Proxy**  | `proxy-example`, `erc1967-example`, `erc1967-invalid-example`, `uups-proxy-example`, `uups-proxy-new-version-example`                                                                                             |
| **Crypto** | `eddsa-example`, `pedersen-example`, `poseidon-example`, `merkle-proofs-example`, `precompiles-example`                                                                                                           |
| **Other**  | `basic-example`                                                                                                                                                                                                   |

### Not tested (documented in repo)

| Contract                                   | Reason                                                       |
| ------------------------------------------ | ------------------------------------------------------------ |
| `erc721-metadata`                          | WASM too large (~25 KB, exceeds 24 KB single-fragment limit) |
| `erc20-flash-mint`                         | Toolchain issue (`branches` crate incompatible with nightly) |
| `beacon-proxy`, `upgradeable-beacon`, etc. | Empty/error-only ABI                                         |

## Project Layout

```
hardhat-examples/
├── hardhat.config.ts       # plugin + host toolchain
├── package.json
├── scripts/                # automation (discover, compile-all, run-all-tests)
├── hardhat-stylus/         # shared toolchain templates
└── test/openzeppelin/      # 22 test files + test-helpers.ts
```

On `npm install`, `hardhat-ensure-contracts-link.mjs` copies `../examples/` → `contracts/` (gitignored, generated at runtime).

## Plugin Configuration

```typescript
// hardhat-examples/hardhat.config.ts
plugins: [hardhatToolboxViemPlugin, hardhatArbitrumStylusPlugin],

stylus: {
  node: { /* nitro-devnode on port 8547, chain ID 412346 */ },
  compile: { useHostToolchain: true },
  deploy: { useHostToolchain: true },
},
```

## How to Run

```bash
git clone https://github.com/CoBuilders-xyz/rust-contracts-stylus.git
cd rust-contracts-stylus
git checkout hardhat-plugin-examples

cd hardhat-examples
npm install          # copies examples → contracts/
npm run prepare:hardhat
npm test             # deploys + runs all 22 test suites
```

**Requirements:** Node 22+, Docker (for Nitro node), Rust nightly (`2025-08-01`) with `wasm32-unknown-unknown`, `cargo-stylus`.

### Individual contract

```bash
npx hardhat arb:compile --stylus --host --contracts erc20-example
npx hardhat arb:deploy --host erc20-example
npx hardhat test test/openzeppelin/erc20-example.test.ts
```

## Example Test

```typescript
const { stylusViem } = await network.create();
const contract = await stylusViem.deployContract('erc20-example', [
  'TestToken',
  'TTK',
  CAP,
]);
const hash = await contract.write.mint([wallet.account.address, 100n]);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
assert.equal(receipt.status, 'success');
```
