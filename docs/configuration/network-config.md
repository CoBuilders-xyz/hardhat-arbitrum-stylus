# Network Configuration

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page documents network configuration for connecting to Arbitrum networks.

WHAT TO WRITE:
- Configuring networks in Hardhat
- Local node network setup
- Connecting to Arbitrum testnets (Sepolia)
- Connecting to Arbitrum mainnet
- RPC URLs and chain IDs

SECTIONS TO INCLUDE:

1. Overview
   - How Hardhat networks work
   - Integration with arb-node plugin

2. Local Network (nitro-devnode)
   - Auto-configured by the plugin
   - Manual network entry if needed

3. Arbitrum Networks
   - Arbitrum One (mainnet)
   - Arbitrum Sepolia (testnet)
   - Arbitrum Nova

4. Network Configuration Examples
   - Basic network setup
   - With private key
   - With HD wallet

5. Chain IDs Reference
   - Local: 412346
   - Arbitrum One: 42161
   - Arbitrum Sepolia: 421614
   - Arbitrum Nova: 42170

REFERENCE MATERIALS:
- Hardhat network configuration docs
- Arbitrum chain information
- packages/hardhat-arb-node/src/hook-handlers/network.ts

=============================================================================
-->

This page covers configuring networks for Arbitrum development.

## Overview

<!-- 
Explain how network configuration works:
- Hardhat's network system
- How the node plugin adds a local network
- Connecting to external networks
-->

Hardhat Arbitrum Stylus works with Hardhat's standard network configuration system.

## Local Network

When using the Node plugin, a local network is available at:

- **HTTP:** `http://localhost:8547`
- **WebSocket:** `ws://localhost:8548`
- **Chain ID:** `412346`

### Using the Local Network

```typescript
import { createPublicClient, http } from 'viem';

const client = createPublicClient({
  transport: http('http://localhost:8547'),
});
```

## Arbitrum Networks Reference

| Network | Chain ID | Type |
|---------|----------|------|
| Local (nitro-devnode) | `412346` | Development |
| Arbitrum One | `42161` | Mainnet |
| Arbitrum Nova | `42170` | Mainnet |
| Arbitrum Sepolia | `421614` | Testnet |

## Network Configuration

### Arbitrum Sepolia (Testnet)

```typescript
export default {
  networks: {
    arbitrumSepolia: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

### Arbitrum One (Mainnet)

```typescript
export default {
  networks: {
    arbitrumOne: {
      url: 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

### Local Network (Explicit)

While the node plugin provides this automatically, you can configure it explicitly:

```typescript
export default {
  networks: {
    local: {
      url: 'http://localhost:8547',
      chainId: 412346,
      accounts: [
        // Pre-funded account #0
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      ],
    },
  },
};
```

## RPC Providers

### Public RPC Endpoints

| Network | Public RPC |
|---------|-----------|
| Arbitrum One | `https://arb1.arbitrum.io/rpc` |
| Arbitrum Sepolia | `https://sepolia-rollup.arbitrum.io/rpc` |
| Arbitrum Nova | `https://nova.arbitrum.io/rpc` |

### Third-Party Providers

For production applications, consider using dedicated RPC providers:

<!-- 
List providers:
- Alchemy
- Infura
- QuickNode
- etc.
-->

```typescript
export default {
  networks: {
    arbitrumOne: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      chainId: 42161,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

## Environment Variables

Best practice for managing credentials:

```typescript
import 'dotenv/config';

export default {
  networks: {
    arbitrumSepolia: {
      url: process.env.ARB_SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
```

```bash
# .env
ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
PRIVATE_KEY=0x...
```

!!! warning "Security"
    Never commit private keys or `.env` files to version control.

## HD Wallet Configuration

```typescript
export default {
  networks: {
    arbitrumSepolia: {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        count: 10,
      },
    },
  },
};
```
