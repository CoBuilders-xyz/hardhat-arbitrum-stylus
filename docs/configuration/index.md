# Configuration Overview

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This is the overview page for the Configuration section.

WHAT TO WRITE:
- Overview of how configuration works in Hardhat Arbitrum Stylus
- Configuration file structure (hardhat.config.ts)
- TypeScript vs JavaScript configuration
- Default values and override patterns
- Links to detailed configuration pages

SECTIONS TO INCLUDE:

1. Configuration File
   - hardhat.config.ts location
   - Basic structure
   - TypeScript benefits

2. Plugin Configuration Namespaces
   - arbNode for node plugin
   - Future namespaces for compile/deploy/test

3. Type Safety
   - HardhatUserConfig type
   - Type extensions from plugins

4. Environment Variables
   - Using environment variables in config
   - Common patterns

5. Configuration Sections
   - Links to detailed pages for each config area

REFERENCE MATERIALS:
- packages/hardhat-arb-node/src/config/types.ts
- packages/hardhat-arb-node/src/type-extensions.ts
- Hardhat 3 configuration documentation

TYPE DEFINITIONS FROM SOURCE:
```typescript
interface ArbNodeUserConfig {
  image?: string;        // Docker image name
  tag?: string;          // Image tag/version
  httpPort?: number;     // HTTP RPC port
  wsPort?: number;       // WebSocket port
  chainId?: number;      // Chain ID
}
```

=============================================================================
-->

This section covers how to configure Hardhat Arbitrum Stylus plugins.

## Configuration File

All configuration goes in `hardhat.config.ts` (or `hardhat.config.js`):

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
  
  // Plugin-specific configuration
  arbNode: {
    httpPort: 8547,
    wsPort: 8548,
  },
};

export default config;
```

## Configuration Namespaces

Each plugin has its own configuration namespace:

| Plugin | Namespace | Status |
|--------|-----------|--------|
| hardhat-arb-node | `arbNode` | ✅ Available |
| hardhat-arb-compile | `arbCompile` | 🔜 Coming Soon |
| hardhat-arb-deploy | `arbDeploy` | 🔜 Coming Soon |
| hardhat-arb-test | `arbTest` | 🔜 Coming Soon |

## Default Values

<!-- 
Explain that plugins provide sensible defaults
You only need to configure what you want to override
-->

All configuration options have sensible defaults. You only need to specify values you want to override.

```typescript
// Minimal config - uses all defaults
const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
};

// With overrides
const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
  arbNode: {
    httpPort: 9545,  // Override just this one setting
  },
};
```

## TypeScript Support

<!-- 
Explain type extensions
IDE autocomplete
Type safety benefits
-->

Plugins extend Hardhat's type system for full autocomplete and type checking:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';

// arbNode configuration is fully typed
const config: HardhatUserConfig = {
  arbNode: {
    httpPort: 8547,  // ✓ Type-checked
    invalidOption: true,  // ✗ Type error
  },
};
```

## Environment Variables

Use environment variables for sensitive or environment-specific configuration:

```typescript
const config: HardhatUserConfig = {
  arbNode: {
    httpPort: parseInt(process.env.ARB_HTTP_PORT || '8547'),
  },
};
```

## Configuration Sections

- **[Node Configuration](node-config.md)** — Configure the local Arbitrum node
- **[Network Configuration](network-config.md)** — Configure network connections
