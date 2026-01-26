# Architecture

<!-- 
CONTENT DESCRIPTION:
Merged architecture overview for contributors. Covers plugin system, packages, 
container management, and internals. Single comprehensive reference.
-->

This page explains how Hardhat Arbitrum Stylus is built.

## Package Structure

```
hardhat-arbitrum-stylus/
├── packages/
│   ├── hardhat-arbitrum-stylus/   # Toolbox (bundles all plugins)
│   ├── hardhat-arb-node/          # Node management
│   ├── hardhat-arb-compile/       # Compilation (placeholder)
│   ├── hardhat-arb-deploy/        # Deployment (placeholder)
│   ├── hardhat-arb-test/          # Testing (placeholder)
│   ├── hardhat-arb-utils/         # Shared utilities
│   └── config/                    # Shared dev config (private)
```

## Plugin System

Plugins use Hardhat 3's declarative plugin system:

```typescript
const hardhatArbNodePlugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
    hre: () => import('./hook-handlers/hre.js'),
  },
  tasks: [
    task(['arb:node', 'start'], 'Start the local Arbitrum node')
      .addFlag({ name: 'detach', description: 'Run in background' })
      .setAction(() => import('./tasks/start.js'))
      .build(),
  ],
};
```

### Hook Handlers

| Hook | Purpose | Example |
|------|---------|---------|
| `config` | Extend/validate configuration | Add `arbNode` defaults |
| `hre` | Extend runtime environment | Add helpers to HRE |
| `network` | Network-specific behavior | Auto-configure local network |

### Type Extensions

Plugins extend Hardhat types via declaration merging:

```typescript
declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    arbNode?: ArbNodeUserConfig;
  }
}
```

## Container Management

The node plugin uses Docker via `hardhat-arb-utils`:

```
┌─────────────────────┐
│   Node Plugin       │  ← arb:node start
├─────────────────────┤
│  ContainerManager   │  ← High-level lifecycle
├─────────────────────┤
│    DockerClient     │  ← CLI wrapper
├─────────────────────┤
│      Docker         │  ← nitro-devnode container
└─────────────────────┘
```

### ContainerManager

```typescript
const manager = new ContainerManager();

const container = await manager.start({
  image: 'offchainlabs/nitro-node',
  tag: 'v3.7.1-926f1ab',
  ports: [{ host: 8547, container: 8547 }],
  readinessCheck: {
    type: 'http',
    target: 'http://localhost:8547',
    timeout: 60000,
  },
});

await manager.stop(container.id);
```

## Chain Setup

When node starts, it performs:

1. **Chain ownership** — Become chain owner via ArbOwner precompile
2. **L1 price = 0** — Simplify gas for development
3. **Prefund accounts** — 10 ETH to Hardhat's 20 default accounts
4. **Stylus infrastructure** (with `--stylus-ready`):
   - CREATE2 Factory
   - Cache Manager
   - StylusDeployer

## Error Handling

Use `createPluginError` for user-facing errors:

```typescript
import { createPluginError } from '@cobuilders/hardhat-arb-utils';

if (await isPortInUse(port)) {
  throw createPluginError(`Port ${port} is already in use`);
}
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/*/src/index.ts` | Plugin entry point |
| `packages/*/src/tasks/*.ts` | Task implementations |
| `packages/*/src/hook-handlers/*.ts` | Hardhat hooks |
| `packages/hardhat-arb-utils/src/container/` | Docker utilities |
