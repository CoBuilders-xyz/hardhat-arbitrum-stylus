# Configuration

<!-- 
CONTENT DESCRIPTION:
All configuration options in one page. Covers node config and network setup.
-->

Configure Hardhat Arbitrum Stylus in your `hardhat.config.ts`.

## Node Configuration

```typescript
export default {
  plugins: [hardhatArbitrumStylus],
  
  arbNode: {
    image: 'offchainlabs/nitro-node',  // Docker image
    tag: 'v3.7.1-926f1ab',             // Image version
    httpPort: 8547,                     // HTTP RPC port
    wsPort: 8548,                       // WebSocket port
    chainId: 412346,                    // Chain ID
  },
};
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `image` | string | `offchainlabs/nitro-node` | Docker image name |
| `tag` | string | `v3.7.1-926f1ab` | Image tag/version |
| `httpPort` | number | `8547` | HTTP RPC port |
| `wsPort` | number | `8548` | WebSocket port |
| `chainId` | number | `412346` | Chain ID |

### Command-Line Overrides

```bash
npx hardhat arb:node start --http-port 9545 --ws-port 9546
```

## Network Configuration

### Local Network

The local node runs at:

- **HTTP:** `http://localhost:8547`
- **WebSocket:** `ws://localhost:8548`
- **Chain ID:** `412346`

### External Networks

```typescript
export default {
  networks: {
    arbitrumSepolia: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumOne: {
      url: 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

### Chain IDs Reference

| Network | Chain ID |
|---------|----------|
| Local (nitro-devnode) | 412346 |
| Arbitrum One | 42161 |
| Arbitrum Nova | 42170 |
| Arbitrum Sepolia | 421614 |
