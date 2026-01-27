# Configuration

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
| `httpPort` | number | `8547` | HTTP RPC port (for `arb:node start`) |
| `wsPort` | number | `8548` | WebSocket port (for `arb:node start`) |
| `chainId` | number | `412346` | Chain ID |

!!! note "Internal Configuration"
    The `devAccount` (chain owner) is configured internally and cannot be changed. See [Pre-funded Accounts](plugins/node.md#pre-funded-accounts) for the full list.

### Command-Line Overrides

```bash
npx hardhat arb:node start --httpPort 9545 --wsPort 9546
```

## Default Network

The plugin automatically configures a `default` network that:

- Uses a **random port** (10000-60000) to avoid conflicts
- **Auto-starts** the node when you connect (see [Auto-Start Feature](plugins/node.md#auto-start-feature))
- Pre-configures all 20 Hardhat accounts

```typescript
// The default network is configured automatically
// You don't need to define it in your config
```

This means tests and scripts work without manually starting the node:

```typescript
// This automatically starts a temp node if needed
const connection = await hre.network.connect();
```

!!! info "Port Behavior"
    - **Manual start** (`arb:node start`): Uses `httpPort`/`wsPort` from config (default: 8547/8548)
    - **Auto-start** (via network hook): Uses random ports to avoid conflicts

## Network Configuration

### Local Network (Manual)

When starting the node manually with `arb:node start`:

- **HTTP:** `http://localhost:8547`
- **WebSocket:** `ws://localhost:8548`
- **Chain ID:** `412346`

### External Networks

```typescript
export default {
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

### Chain IDs Reference

| Network | Chain ID |
|---------|----------|
| Local (nitro-devnode) | 412346 |
| Arbitrum One | 42161 |
| Arbitrum Nova | 42170 |
| Arbitrum Sepolia | 421614 |
