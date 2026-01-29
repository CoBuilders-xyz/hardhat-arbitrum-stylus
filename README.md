# Hardhat Arbitrum Stylus

[![CI](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/actions/workflows/ci.yml/badge.svg)](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/actions/workflows/ci.yml)
[![Release](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/actions/workflows/release.yml/badge.svg)](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/actions/workflows/release.yml)
[![GitHub release](https://img.shields.io/github/v/release/CoBuilders-xyz/hardhat-arbitrum-stylus)](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus/releases)
[![License](https://img.shields.io/github/license/CoBuilders-xyz/hardhat-arbitrum-stylus)](LICENSE)
[![npm](https://img.shields.io/npm/v/@cobuilders/hardhat-arbitrum-stylus)](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus)
[![npm downloads](https://img.shields.io/npm/dw/@cobuilders/hardhat-arbitrum-stylus)](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus)

Hardhat plugin suite for Arbitrum Stylus development.

## Packages

| Package                                                                   | Description                    |
| ------------------------------------------------------------------------- | ------------------------------ |
| [@cobuilders/hardhat-arbitrum-stylus](./packages/hardhat-arbitrum-stylus) | Toolbox — includes all plugins |
| [@cobuilders/hardhat-arb-compile](./packages/hardhat-arb-compile)         | Compile Stylus contracts       |
| [@cobuilders/hardhat-arb-deploy](./packages/hardhat-arb-deploy)           | Deploy Stylus contracts        |
| [@cobuilders/hardhat-arb-node](./packages/hardhat-arb-node)               | Run local Arbitrum node        |
| [@cobuilders/hardhat-arb-test](./packages/hardhat-arb-test)               | Test against Arbitrum node     |

## Quick Start

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

```ts
// hardhat.config.ts
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

## Documentation

📖 **[Read the docs](https://cobuilders-xyz.github.io/hardhat-arbitrum-stylus/)** | [Source](./docs)

## License

MIT
