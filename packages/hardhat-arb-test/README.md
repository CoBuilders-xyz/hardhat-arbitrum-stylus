# @cobuilders/hardhat-arb-test

Hardhat plugin for testing against an Arbitrum node.

> This plugin is part of [@cobuilders/hardhat-arbitrum-stylus](../hardhat-arbitrum-stylus). Install the main package to use it.

## Task

```
npx hardhat arb:test
```

Runs tests against the Arbitrum node.

You can set the default host mode in `hardhat.config.ts`:

```ts
stylus: {
  test: {
    useHostToolchain: true,
  },
}
```

## Documentation

📖 **[Read the docs](https://cobuilders-xyz.github.io/hardhat-arbitrum-stylus/plugins/test/)** | [Source](../../docs)

## License

MIT
