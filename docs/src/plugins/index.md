# Plugins Overview

<!-- 
CONTENT DESCRIPTION:
Simple overview of all plugins with status. Merged with toolbox info.
-->

Hardhat Arbitrum Stylus provides a suite of plugins for Stylus development.

## Installation

Install the toolbox to get all plugins:

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

```typescript
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

Or install individual plugins:

```bash
npm install @cobuilders/hardhat-arb-node
```

## Available Plugins

| Plugin | Package | Status |
|--------|---------|--------|
| [Node](node.md) | `@cobuilders/hardhat-arb-node` | ✅ Available |
| [Compile](compile.md) | `@cobuilders/hardhat-arb-compile` | 🔜 Coming Soon |
| [Deploy](deploy.md) | `@cobuilders/hardhat-arb-deploy` | 🔜 Coming Soon |
| [Test](test.md) | `@cobuilders/hardhat-arb-test` | 🔜 Coming Soon |

## All Tasks

```bash
npx hardhat arb:node start    # Start local Arbitrum node
npx hardhat arb:node stop     # Stop the node
npx hardhat arb:node status   # Check node status
npx hardhat arb:node logs     # View node logs
npx hardhat arb:compile       # Compile Stylus contracts (coming soon)
npx hardhat arb:deploy        # Deploy contracts (coming soon)
npx hardhat arb:test          # Run tests (coming soon)
```
