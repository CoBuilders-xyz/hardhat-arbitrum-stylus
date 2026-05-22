# zkVM Verifiers (Gnosis)

Integration tests for [Gnosis Guild's stylus-zkvm-verifiers](https://github.com/gnosisguild/stylus-zkvm-verifiers) zero-knowledge proof verifiers running on Arbitrum Stylus.

[:fontawesome-brands-github: View repo](https://github.com/CoBuilders-xyz/stylus-zkvm-verifiers/tree/cobuilders/hardhat-test-suite){ .md-button }

## Repository

|              |                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Fork**     | [CoBuilders-xyz/stylus-zkvm-verifiers](https://github.com/CoBuilders-xyz/stylus-zkvm-verifiers) |
| **Branch**   | `cobuilders/hardhat-test-suite`                                                                 |
| **Upstream** | [gnosisguild/stylus-zkvm-verifiers](https://github.com/gnosisguild/stylus-zkvm-verifiers)       |

## Why This Repo

Gnosis Guild's zkVM verifiers are complex Stylus contracts. They verify Groth16 proofs from RISC Zero and SP1 inside Rust/WASM.

## Contracts Tested

| Contract                 | Crate                             | What it does                                     |
| ------------------------ | --------------------------------- | ------------------------------------------------ |
| `risc0-verifier-example` | RISC Zero Groth16 verifier (v2.1) | `initialize()`, `verify()` with real proof bytes |
| `sp1-verifier-example`   | SP1 Groth16 verifier (v5.0.0)     | `verifyProof()` with valid and corrupted proofs  |

The upstream library crates (`risc0/`, `sp1/`, `common/`) are unchanged. Example contracts under `examples/` are copied into `contracts/` by a `prepare.mjs` script on `npm install`.

## Test Coverage

### `test/risc0-verifier.test.ts` (9 tests)

- Deploy on Stylus test node (chain ID 412346)
- Check `isInitialized()` state
- Call `initialize(control_root, bn254_control_id)`
- Read `getBn254ControlId()`, `getSelector()`, `getVerifierKeyDigest()`
- Verify double-initialize reverts
- **`verify()` returns `true` for a real RISC Zero proof**

### `test/sp1-verifier.test.ts` (5 tests)

- Deploy on Stylus test node
- `version()` returns `v5.0.0`
- `verifierHash()` matches expected hash
- **`verifyProof()` succeeds with valid SP1 proof bytes**
- `verifyProof()` reverts when proof bytes are corrupted

## Plugin Configuration

```typescript
// hardhat.config.ts
plugins: [hardhatToolboxViemPlugin, hardhatArbitrumStylusPlugin],

stylus: {
  node: {
    image: 'offchainlabs/nitro-node',
    tag: 'v3.7.1-926f1ab',
    httpPort: 8547,
    chainId: 412346,
  },
  compile: { useHostToolchain: true },
  deploy: { useHostToolchain: true },
},
```

Uses **host toolchain** mode compile and deploy run with local Rust/cargo-stylus instead of Docker.

## How to Run

```bash
git clone https://github.com/CoBuilders-xyz/stylus-zkvm-verifiers.git
cd stylus-zkvm-verifiers
git checkout cobuilders/hardhat-test-suite

npm install          # runs prepare.mjs to stage contracts
npm test             # deploys + runs all verifier tests
```

**Requirements:** Node 22+, Docker (for Nitro node), Rust nightly (`2025-08-01`), `cargo-stylus@0.6.3`.
