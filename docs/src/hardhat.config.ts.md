# hardhat.config.ts

Use a single `hardhat.config.ts` that includes Hardhat viem tooling plus the Arbitrum Stylus plugin configuration:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import hardhatArbitrumStylusPlugin from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, hardhatArbitrumStylusPlugin],
  solidity: '0.8.24',

  // Arbitrum Stylus plugin configuration (all values shown are defaults)
  stylus: {
    node: {
      image: 'offchainlabs/nitro-node',
      tag: 'v3.7.1-926f1ab',
      httpPort: 8547,
      wsPort: 8548,
      chainId: 412346,
    },
    compile: {
      useHostToolchain: false,
    },
    deploy: {
      useHostToolchain: false,
    },
    test: {
      useHostToolchain: false,
    },
  },
};

export default config;
```

## Section by section

### `plugins`

- `@nomicfoundation/hardhat-toolbox-viem` enables viem-based Hardhat workflows.
- `@cobuilders/hardhat-arbitrum-stylus` registers `arb:*` tasks and Stylus integrations.

### `solidity`

- `solidity: '0.8.24'` is the Solidity compiler version used for EVM contracts in the same project.

### `stylus.node`

- `image`: Docker image used for the local Arbitrum Nitro devnode.
- `tag`: Docker image tag.
- `httpPort`: HTTP RPC port exposed locally.
- `wsPort`: WebSocket RPC port exposed locally.
- `chainId`: chain ID used by the local node.

### `stylus.compile`

- `useHostToolchain: false` means Stylus compile runs in Docker by default.
- Set `true` to use your local Rust/cargo-stylus toolchain instead.

### `stylus.deploy`

- `useHostToolchain: false` means Stylus deploy runs in Docker by default.
- Set `true` to deploy with your local Rust/cargo-stylus toolchain instead.

### `stylus.test`

- `useHostToolchain: false` means `arb:test` uses Docker mode for Stylus by default.
- Set `true` to run `arb:test` in host mode by default (local Rust/cargo-stylus toolchain).
