# Plugin Anatomy

Every plugin follows this structure:

```
packages/hardhat-arb-node/
├── src/
│   ├── index.ts              # Plugin definition
│   ├── type-extensions.ts    # Config type extensions
│   ├── tasks/                # CLI commands
│   └── hook-handlers/        # Lifecycle hooks
└── test/
```

---

## index.ts

The entry point. Declares everything the plugin provides:

```typescript
const hardhatArbNodePlugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
    network: () => import('./hook-handlers/network.js'),
  },
  tasks: [
    task(['arb:node', 'start'], 'Start the node')
      .setAction(() => import('./tasks/start.js'))
      .build(),
  ],
};

export default hardhatArbNodePlugin;
```

---

## type-extensions.ts

Extends Hardhat's TypeScript types. This enables:

- **Type checking** — Invalid config options cause compile errors
- **Autocomplete** — IDEs suggest valid options

```typescript
declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    arbNode?: ArbNodeUserConfig;
  }
  interface HardhatConfig {
    arbNode: ArbNodeConfig;
  }
}
```

Now `hardhat.config.ts` is fully typed:

```typescript
export default {
  arbNode: {
    httpPort: 8547, // ✓ Valid
    invalidOption: true, // ✗ TypeScript error
  },
};
```

---

## tasks/

Each file exports a task action. See [Tasks](tasks.md) for details.

---

## hook-handlers/

Each file exports hook functions. See [Hooks](hooks.md) for details.
