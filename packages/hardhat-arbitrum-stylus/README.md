# @cobuilders/hardhat-arbitrum-stylus

Hardhat toolbox for Arbitrum Stylus development. Includes all plugins in one package.

## Installation

```bash
npm install @cobuilders/hardhat-arbitrum-stylus
```

## Usage

```ts
// hardhat.config.ts
import hardhatArbitrumStylus from '@cobuilders/hardhat-arbitrum-stylus';

export default {
  plugins: [hardhatArbitrumStylus],
};
```

This registers all Stylus tasks:

- `arb:node` — Start local Arbitrum node
- `arb:compile` — Compile Stylus contracts
- `arb:deploy` — Deploy contracts
- `arb:test` — Run tests

## Documentation

📖 **[Read the docs](https://cobuilders-xyz.github.io/hardhat-arbitrum-stylus/plugins/)** | [Source](../../docs)

## License

MIT
