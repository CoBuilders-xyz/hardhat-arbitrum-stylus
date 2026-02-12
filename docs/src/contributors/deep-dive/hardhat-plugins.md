# Hardhat Plugins 101

A Hardhat plugin extends Hardhat by adding:

- **Tasks** - CLI commands (`npx hardhat my-task`)
- **Configuration** - New options in `hardhat.config.ts`
- **Hooks** - Code that runs at specific lifecycle points

## Plugin Definition

Plugins are simple objects:

```typescript
const myPlugin: HardhatPlugin = {
  id: 'my-plugin',
  npmPackage: '@my-org/my-plugin',
  tasks: [...],
  hookHandlers: {...},
};

export default myPlugin;
```

Hardhat loads this at startup and registers everything.

## Learn More

For the complete guide, see the [official Hardhat plugin docs](https://hardhat.org/hardhat-runner/docs/advanced/building-plugins).
