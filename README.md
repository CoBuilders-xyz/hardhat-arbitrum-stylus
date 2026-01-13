# Hardhat Arbitrum Stylus

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

See the [docs](./docs) folder for detailed documentation:

## License

MIT
