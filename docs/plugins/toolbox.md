# Toolbox Plugin

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This page documents the main toolbox plugin (@cobuilders/hardhat-arbitrum-stylus).

WHAT TO WRITE:
- What the toolbox is and what it includes
- Installation and basic usage
- All tasks registered by the toolbox
- Configuration options inherited from sub-plugins
- When to use toolbox vs individual plugins

SECTIONS TO INCLUDE:

1. Overview
   - What is the toolbox
   - What plugins it bundles
   - Single install convenience

2. Installation
   - npm/pnpm/yarn commands
   - Config setup

3. Registered Tasks
   - List all tasks from all bundled plugins
   - Brief description of each

4. Configuration
   - All configuration options
   - Links to detailed config pages

5. Package Contents
   - List of dependencies
   - Version information

REFERENCE MATERIALS:
- packages/hardhat-arbitrum-stylus/src/index.ts
- packages/hardhat-arbitrum-stylus/README.md
- packages/hardhat-arbitrum-stylus/package.json

SOURCE CODE REFERENCE:
The toolbox simply imports and re-exports all other plugins:
```typescript
const hardhatArbitrumStylusPlugin: HardhatPlugin = {
  id: 'hardhat-arbitrum-stylus',
  dependencies: () => [
    import('@cobuilders/hardhat-arb-node'),
    import('@cobuilders/hardhat-arb-compile'),
    import('@cobuilders/hardhat-arb-deploy'),
    import('@cobuilders/hardhat-arb-test'),
  ],
  npmPackage: '@cobuilders/hardhat-arbitrum-stylus',
};
```

=============================================================================
-->

**Package:** `@cobuilders/hardhat-arbitrum-stylus`

The toolbox plugin provides a single installation that includes all Hardhat Arbitrum Stylus plugins.

## Overview

<!-- 
Explain:
- All-in-one installation
- Bundles: node, compile, deploy, test
- Simplifies dependency management
-->

## Installation

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

```typescript
// hardhat.config.ts
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

## Included Plugins

| Plugin | Tasks | Status |
|--------|-------|--------|
| [hardhat-arb-node](node.md) | `arb:node start`, `arb:node stop`, `arb:node status`, `arb:node logs` | ✅ Available |
| [hardhat-arb-compile](compile.md) | `arb:compile` | 🔜 Coming Soon |
| [hardhat-arb-deploy](deploy.md) | `arb:deploy` | 🔜 Coming Soon |
| [hardhat-arb-test](test.md) | `arb:test` | 🔜 Coming Soon |

## All Registered Tasks

```bash
npx hardhat arb:node start    # Start local Arbitrum node
npx hardhat arb:node stop     # Stop the node
npx hardhat arb:node status   # Check node status
npx hardhat arb:node logs     # View node logs
npx hardhat arb:compile       # Compile Stylus contracts (coming soon)
npx hardhat arb:deploy        # Deploy contracts (coming soon)
npx hardhat arb:test          # Run tests (coming soon)
```

## Configuration

The toolbox inherits configuration from all bundled plugins:

```typescript
export default {
  plugins: [hardhatArbitrumStylus],
  
  // Node configuration
  arbNode: {
    httpPort: 8547,
    wsPort: 8548,
    // ... see Node Configuration
  },
  
  // Compile configuration (coming soon)
  // Deploy configuration (coming soon)
  // Test configuration (coming soon)
};
```

→ [Full Configuration Reference](../configuration/index.md)

## When to Use the Toolbox

<!-- 
Recommend toolbox for:
- Most users
- Full workflow
- Simplicity

Recommend individual plugins for:
- Specific features only
- Smaller node_modules
- Custom setups
-->
