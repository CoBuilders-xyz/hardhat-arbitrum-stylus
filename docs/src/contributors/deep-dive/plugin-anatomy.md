# Plugin Anatomy

Every plugin follows this structure:

```
packages/hardhat-arb-node/
├── src/
│   ├── index.ts              # Stable entrypoint (re-exports plugin)
│   └── plugin/
│       ├── index.ts          # Plugin definition
│       ├── type-extensions.ts
│       ├── tasks/            # CLI commands
│       └── hooks/            # Lifecycle hooks
└── test/
```

---

## plugin/index.ts

The plugin entry point. Declares everything the plugin provides:

```typescript
const hardhatArbNodePlugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  hookHandlers: {
    config: () => import('./hooks/config.js'),
    network: () => import('./hooks/network.js'),
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

`src/index.ts` stays as a compatibility wrapper:

```typescript
export { default } from './plugin/index.js';
export * from './plugin/index.js';
```

---

## plugin/type-extensions.ts

Extends Hardhat's TypeScript types. This enables:

- **Type checking** - Invalid config options cause compile errors
- **Autocomplete** - IDEs suggest valid options

```typescript
declare module 'hardhat/types/config' {
  interface StylusUserConfig {
    node?: ArbNodeUserConfig;
  }

  interface StylusConfig {
    node: ArbNodeConfig;
  }

  interface HardhatUserConfig {
    stylus?: StylusUserConfig;
  }

  interface HardhatConfig {
    stylus: StylusConfig;
  }
}
```

Now `hardhat.config.ts` is fully typed:

```typescript
export default {
  stylus: {
    node: {
      httpPort: 8547, // ✓ Valid
      invalidOption: true, // ✗ TypeScript error
    },
  },
};
```

---

## plugin/tasks/

Each file exports a task action. See [Tasks](tasks.md) for details.

---

## plugin/hooks/

Each file exports hook functions. See [Hooks](hooks.md) for details.
