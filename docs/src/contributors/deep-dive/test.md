# Test Plugin

The test plugin (`hardhat-arb-test`) wraps Hardhat's test runner with Stylus support. It handles mode selection (container vs host), Solidity pre-compilation, and toolchain validation.

---

## How `arb:test` Works

The task decides between two runners based on the `--host` flag or `stylus.test.useHostToolchain` config:

1. **Resolve mode** Check `--host` flag or config. Call `setTestHostMode()` from the deploy plugin so that `stylusViem.deployContract()` uses the correct deploy path during tests.
2. **Run tests** Delegate to the host runner or the container runner.
3. **Reset mode** Clear the host mode flag in a `finally` block.

---

## Container Mode (Default)

Container mode bypasses the Hardhat test runner and spawns `node --test` directly with `--test-concurrency=1`. This forces sequential execution to avoid overwhelming Docker with parallel devnode + compilation containers.

The flow:

1. **Warn** Print a message explaining that tests run sequentially and suggesting `--host` for faster parallel execution.
2. **Set environment** `HH_TEST=true`, inject `tsx` import via `NODE_OPTIONS` (so TypeScript tests run without a separate compile step).
3. **Compile Solidity** Run `hardhat build` unless `--no-compile` is set.
4. **Resolve test files** Find all `*.test.ts` files in the configured test directory, or use the explicit file list.
5. **Build args** Assemble `node --test` arguments (concurrency=1, grep, only, etc.).
6. **Spawn** Run `node --test` as a child process and wait for exit.

If the test runner exits with a non-zero code or is killed by a signal, the task sets `process.exitCode = 1`.

---

## Host Mode

Host mode delegates to Hardhat's built-in test runner (`test:nodejs` task), which runs tests in parallel. Before delegating, it validates host toolchain requirements.

The flow:

1. **Discover contracts** Uses `discoverStylusContractsFromSources()` to find all Stylus contracts and their required toolchains.
2. **Validate toolchains** Calls `validateAllToolchains()` to check `rustup`, `cargo-stylus`, each required toolchain, and `wasm32-unknown-unknown` targets. Results are cached per unique toolchain set so repeated test runs skip validation.
3. **Delegate** Calls `hre.tasks.getTask(['test', 'nodejs']).run()` with the original test options.

---

## Preflight Cache

The `state/preflight-cache.ts` module avoids re-validating toolchains on every test run. It creates a cache key from the sorted, deduplicated toolchain versions. If that exact set has already been validated in this process, validation is skipped.

---

## How Stylus Contracts Get Deployed in Tests

The test plugin itself does not deploy contracts. That happens through the deploy plugin's `stylusViem` network hook:

1. Test calls `network.create()` the node plugin auto-starts a temp Arbitrum node.
2. Test calls `stylusViem.deployContract('my-contract')` the deploy plugin's hook discovers the contract, exports its ABI, and runs `cargo stylus deploy` (in Docker or on host, depending on the mode set by `arb:test`).
3. The hook returns a viem contract instance with `.read`, `.write`, `.getEvents`.

---

## Integration Points

- **`hardhat-arb-deploy`** Provides `setTestHostMode()` to coordinate the deploy mode during tests, and the `stylusViem` network hook that handles actual deployment.
- **`hardhat-arb-utils`** Provides `discoverStylusContractsFromSources` and `validateAllToolchains` for host-mode preflight checks, and `createPluginError` for error handling.
