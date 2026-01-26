# Node Configuration

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page documents all configuration options for the hardhat-arb-node plugin.

WHAT TO WRITE:
- Complete reference of all arbNode configuration options
- Type definitions
- Default values
- Examples for each option
- Common configuration patterns

SECTIONS TO INCLUDE:

1. Configuration Reference
   - Table with all options, types, defaults
   - Description of each option

2. Options Detail
   - image: Docker image name
   - tag: Image version
   - httpPort: HTTP RPC port
   - wsPort: WebSocket port
   - chainId: Chain ID

3. Examples
   - Default configuration
   - Custom ports
   - Custom Docker image
   - Full configuration example

4. Type Definitions
   - ArbNodeUserConfig interface
   - ArbNodeConfig (resolved) interface

REFERENCE MATERIALS:
- packages/hardhat-arb-node/src/config/types.ts
- packages/hardhat-arb-node/src/config/defaults.ts
- packages/hardhat-arb-node/src/config/resolver.ts

TYPE DEFINITIONS FROM SOURCE:
```typescript
interface ArbNodeUserConfig {
  image?: string;        // default: "offchainlabs/nitro-node"
  tag?: string;          // default: "v3.7.1-926f1ab"
  httpPort?: number;     // default: 8547
  wsPort?: number;       // default: 8548
  chainId?: number;      // default: 412346
}
```

DEFAULT VALUES FROM SOURCE:
- Image: offchainlabs/nitro-node
- Tag: v3.7.1-926f1ab (check defaults.ts for current)
- HTTP Port: 8547
- WS Port: 8548
- Chain ID: 412346
- Container Name: nitro-devnode

=============================================================================
-->

This page documents all configuration options for the Node plugin (`@cobuilders/hardhat-arb-node`).

## Quick Reference

```typescript
export default {
  arbNode: {
    image: 'offchainlabs/nitro-node',  // Docker image
    tag: 'v3.7.1-926f1ab',             // Image tag
    httpPort: 8547,                     // HTTP RPC port
    wsPort: 8548,                       // WebSocket port
    chainId: 412346,                    // Chain ID
  },
};
```

## Configuration Options

### `image`

Docker image name for the Arbitrum node.

| Property | Value |
|----------|-------|
| Type | `string` |
| Default | `"offchainlabs/nitro-node"` |
| Required | No |

```typescript
arbNode: {
  image: 'offchainlabs/nitro-node',
}
```

### `tag`

Docker image tag/version.

| Property | Value |
|----------|-------|
| Type | `string` |
| Default | `"v3.7.1-926f1ab"` |
| Required | No |

```typescript
arbNode: {
  tag: 'v3.7.1-926f1ab',
}
```

!!! tip "Version Compatibility"
    The default tag is tested with this plugin version. Change only if you need a specific nitro-devnode version.

### `httpPort`

HTTP JSON-RPC port on the host machine.

| Property | Value |
|----------|-------|
| Type | `number` |
| Default | `8547` |
| Required | No |

```typescript
arbNode: {
  httpPort: 8547,
}
```

### `wsPort`

WebSocket port on the host machine.

| Property | Value |
|----------|-------|
| Type | `number` |
| Default | `8548` |
| Required | No |

```typescript
arbNode: {
  wsPort: 8548,
}
```

### `chainId`

Chain ID for the local network.

| Property | Value |
|----------|-------|
| Type | `number` |
| Default | `412346` |
| Required | No |

```typescript
arbNode: {
  chainId: 412346,
}
```

!!! note "Chain ID"
    The default chain ID `412346` (hex: `0x64a7a`) is the standard nitro-devnode chain ID.

## Type Definitions

```typescript
/**
 * User-provided configuration (all optional)
 */
interface ArbNodeUserConfig {
  image?: string;
  tag?: string;
  httpPort?: number;
  wsPort?: number;
  chainId?: number;
}

/**
 * Resolved configuration (all required, with defaults applied)
 */
interface ArbNodeConfig {
  image: string;
  tag: string;
  httpPort: number;
  wsPort: number;
  chainId: number;
  devAccount: {
    address: Hex;
    privateKey: Hex;
  };
}
```

## Examples

### Default Configuration

Uses all default values:

```typescript
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
  // arbNode uses defaults
};
```

### Custom Ports

Useful when running multiple nodes or avoiding port conflicts:

```typescript
export default {
  plugins: [hardhatArbitrumStylus],
  arbNode: {
    httpPort: 9545,
    wsPort: 9546,
  },
};
```

### Full Configuration

All options explicitly set:

```typescript
export default {
  plugins: [hardhatArbitrumStylus],
  arbNode: {
    image: 'offchainlabs/nitro-node',
    tag: 'v3.7.1-926f1ab',
    httpPort: 8547,
    wsPort: 8548,
    chainId: 412346,
  },
};
```

## Command-Line Overrides

Configuration can be overridden via command-line flags:

```bash
# Override ports at runtime
npx hardhat arb:node start --http-port 9545 --ws-port 9546
```

Command-line flags take precedence over configuration file values.

## Environment-Based Configuration

```typescript
const config = {
  arbNode: {
    httpPort: parseInt(process.env.ARB_HTTP_PORT || '8547'),
    wsPort: parseInt(process.env.ARB_WS_PORT || '8548'),
  },
};
```
