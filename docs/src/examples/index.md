# Real-World Examples

Before releasing the plugin, we validated it against **real production Stylus contracts** from three ecosystems. Each example repo forks or vendors upstream contracts unchanged and adds a Hardhat test harness on top.

## Why These Repos Exist

The plugin's own test suite covers basic counters, proxies, and cross-VM interaction. That is not enough to prove the plugin works with the contracts developers actually use in production.

These three repos answer a single question: **can `@cobuilders/hardhat-arbitrum-stylus` compile, deploy, and test real Stylus contracts from Gnosis, OpenZeppelin, and ThirdWeb?**

All three repos:

- Use `@cobuilders/hardhat-arbitrum-stylus` + `@nomicfoundation/hardhat-toolbox-viem`
- Run against a local Nitro devnode (chain ID `412346`)
- Deploy via `stylusViem.deployContract()` in integration tests

## The Three Repos

| Ecosystem                   | Repository                                                                                                               | Contracts tested   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| **Gnosis (zkVM Verifiers)** | [stylus-zkvm-verifiers](https://github.com/CoBuilders-xyz/stylus-zkvm-verifiers/tree/cobuilders/hardhat-test-suite)      | 2 (RISC Zero, SP1) |
| **OpenZeppelin**            | [rust-contracts-stylus](https://github.com/CoBuilders-xyz/rust-contracts-stylus/tree/hardhat-plugin-examples)            | 22                 |
| **ThirdWeb**                | [hardhat-arbitrum-stylus-thirdweb-examples](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus-thirdweb-examples) | 13                 |

## What Each Repo Validates

### Gnosis: Cryptographic Proof Verification

Fork of [Gnosis Guild's stylus-zkvm-verifiers](https://github.com/gnosisguild/stylus-zkvm-verifiers). Tests deploy RISC Zero and SP1 Groth16 verifiers and call `verify()` with **real proof bytes**.

→ [zkVM Verifiers](zkvm-verifiers.md)

### OpenZeppelin: Standard Contract Patterns

Fork of [OpenZeppelin/rust-contracts-stylus](https://github.com/OpenZeppelin/rust-contracts-stylus). Tests 22 example contracts: ERC-20/721/1155/6909, access control, proxies (UUPS, ERC1967), and crypto primitives (Pedersen, Poseidon, EdDSA, Merkle).

→ [OpenZeppelin Contracts](openzeppelin.md)

### ThirdWeb: Module and Extension Patterns

Custom repo consolidating [thirdweb-example](https://github.com/thirdweb-example) Stylus repos (each lived in its own upstream repo). Tests 13 contracts: mintable/transferable ERC modules, airdrops, ZK minting, BN254 precompile helper.

→ [ThirdWeb Contracts](thirdweb.md)

## Common Test Pattern

All three repos follow the same integration-test pattern:

```typescript
const { stylusViem } = await network.create();
const contract = await stylusViem.deployContract('contract-name');
// read/write via generated ABI
const value = await contract.read.someMethod();
await contract.write.someMethod([args]);
```

## Running an Example Locally

Each repo has its own README with prerequisites (Node 22+, Docker, Rust nightly). The general flow:

```bash
git clone <repo-url> && cd <repo>
git checkout <branch>   # if not on main
npm install
npm test                # or npm run test:all
```

See each repo's page for specific setup steps (some require a `prepare` script to stage contracts).
