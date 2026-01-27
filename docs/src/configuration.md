# Configuration

Configure the Hardhat Arbitrum Stylus plugin via your `hardhat.config.ts` file. This configuration is used by both CLI commands and the Hardhat Runtime Environment (HRE).

## Plugin Configuration

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
  
  arbNode: {
    image: 'offchainlabs/nitro-node',
    tag: 'v3.7.1-926f1ab',
    httpPort: 8547,
    wsPort: 8548,
    chainId: 412346,
  },
};

export default config;
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `image` | string | `offchainlabs/nitro-node` | Docker image name |
| `tag` | string | `v3.7.1-926f1ab` | Image tag/version |
| `httpPort` | number | `8547` | HTTP RPC port |
| `wsPort` | number | `8548` | WebSocket port |
| `chainId` | number | `412346` | Chain ID |

All options are optional. Default values are used if not specified.

## External Networks

You can configure external Arbitrum networks for deployment:

```typescript
export default {
  plugins: [hardhatArbitrumStylus],
  
  networks: {
    arbitrumSepolia: {
      type: 'http',
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumOne: {
      type: 'http',
      url: 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

## Chain IDs Reference

| Network | Chain ID |
|---------|----------|
| Local (nitro-devnode) | 412346 |
| Arbitrum One | 42161 |
| Arbitrum Nova | 42170 |
| Arbitrum Sepolia | 421614 |
