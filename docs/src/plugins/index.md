# Plugins Overview

<!--
CONTENT DESCRIPTION:
Simple overview of all plugins with status. Merged with toolbox info.
-->

Hardhat Arbitrum Stylus provides a suite of plugins for Stylus development.

[:fontawesome-brands-github: View on GitHub](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages){ .md-button }

---

## Bundler

**Package:** `@cobuilders/hardhat-arbitrum-stylus`

[:fontawesome-brands-github: Source](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages/hardhat-arbitrum-stylus){ .md-button }
[:fontawesome-brands-npm: npm](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus){ .md-button }

The `@cobuilders/hardhat-arbitrum-stylus` package is a **bundler** that re-exports all the individual plugins in the suite. Instead of installing and configuring each plugin separately, you can install the bundler and get everything at once.

**Why use the bundler?**

- **Single install** - One package instead of multiple
- **Synchronized versions** - All plugins are tested together
- **Simpler config** - One import in your hardhat config

**Installation:**

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

**Configuration:**

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylus],
};

export default config;
```

This single import gives you access to all the plugins: Node, Compile, Deploy, and Test.

---

## Individual Plugins

If you prefer granular control, you can install plugins individually:

```bash
npm install @cobuilders/hardhat-arb-node
```

## Available Plugins

| Plugin                | Package                           | Status         | Links                                                                                                                                                                                                                     |
| --------------------- | --------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Node](node.md)       | `@cobuilders/hardhat-arb-node`    | ✅ Available   | [:fontawesome-brands-github:](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages/hardhat-arb-node) [:fontawesome-brands-npm:](https://www.npmjs.com/package/@cobuilders/hardhat-arb-node)       |
| [Compile](compile.md) | `@cobuilders/hardhat-arb-compile` | ✅ Available   | [:fontawesome-brands-github:](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages/hardhat-arb-compile) [:fontawesome-brands-npm:](https://www.npmjs.com/package/@cobuilders/hardhat-arb-compile) |
| [Deploy](deploy.md)   | `@cobuilders/hardhat-arb-deploy`  | ✅ Available   | [:fontawesome-brands-github:](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages/hardhat-arb-deploy) [:fontawesome-brands-npm:](https://www.npmjs.com/package/@cobuilders/hardhat-arb-deploy)   |
| [Test](test.md)       | `@cobuilders/hardhat-arb-test`    | 🔜 Coming Soon | [:fontawesome-brands-github:](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/tree/main/packages/hardhat-arb-test) [:fontawesome-brands-npm:](https://www.npmjs.com/package/@cobuilders/hardhat-arb-test)       |

## All Tasks

```bash
npx hardhat arb:node start    # Start local Arbitrum node
npx hardhat arb:node stop     # Stop the node
npx hardhat arb:node status   # Check node status
npx hardhat arb:node logs     # View node logs
npx hardhat arb:compile       # Compile Stylus contracts
npx hardhat arb:deploy        # Deploy Solidity or Stylus contracts
npx hardhat arb:test          # Run tests (coming soon)
```
