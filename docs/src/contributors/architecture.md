# Architecture

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

Technical architecture for contributors. More granular than before.

WHAT TO WRITE:
- Package structure and responsibilities
- Plugin system (Hardhat 3)
- Hook handlers explained
- Task system
- Container management
- Chain setup process
- Error handling
- Key files reference

REFERENCE MATERIALS:
- packages/*/src/index.ts
- packages/hardhat-arb-node/src/hook-handlers/*.ts
- packages/hardhat-arb-node/src/tasks/*.ts
- packages/hardhat-arb-utils/src/container/*.ts
- packages/hardhat-arb-utils/src/errors/*.ts

=============================================================================
-->

Technical architecture of Hardhat Arbitrum Stylus Plugin.

## Package Structure

```
packages/
├── hardhat-arbitrum-stylus/   # Toolbox (bundles all plugins)
├── hardhat-arb-node/          # Node management ✅
├── hardhat-arb-compile/       # Compilation (placeholder)
├── hardhat-arb-deploy/        # Deployment (placeholder)
├── hardhat-arb-test/          # Testing (placeholder)
├── hardhat-arb-utils/         # Shared utilities
└── config/                    # Dev config (private)
```

## Plugin System (Hardhat 3)

Plugins are declarative objects:

```typescript
const plugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
    hre: () => import('./hook-handlers/hre.js'),
  },
  tasks: [
    task(['arb:node', 'start'], 'Start node')
      .addFlag({ name: 'detach' })
      .setAction(() => import('./tasks/start.js'))
      .build(),
  ],
};
```

## Hook Handlers

### Config Hook

Extends and validates configuration:

```typescript
const configHookHandler: ConfigHookHandler = {
  extendUserConfig: async (config) => ({
    ...config,
    arbNode: { ...DEFAULTS, ...config.arbNode },
  }),
  validateUserConfig: async (config) => {
    // Validation logic
  },
};
```

### HRE Hook

Extends Hardhat Runtime Environment:

```typescript
const hreHookHandler: HreHookHandler = {
  extendHardhatRuntimeEnvironment: async (hre) => {
    // Add properties to hre
  },
};
```

### Type Extensions

```typescript
declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    arbNode?: ArbNodeUserConfig;
  }
}
```

## Container Management

```
Node Plugin
    │
    ▼
ContainerManager (hardhat-arb-utils)
    │
    ▼
DockerClient (CLI wrapper)
    │
    ▼
Docker daemon → nitro-devnode container
```

**ContainerManager** handles:
- Image pulling
- Container lifecycle (start/stop)
- Readiness checks (HTTP/TCP/exec)

**DockerClient** wraps Docker CLI commands.

## Chain Setup

When `arb:node start` runs:

1. Start nitro-devnode container
2. Wait for RPC ready
3. `becomeChainOwner()` via ArbOwner precompile
4. `setL1PricePerUnit(0)` for dev gas costs
5. Prefund 20 Hardhat accounts (10 ETH each)
6. If `--stylus-ready`:
   - Deploy CREATE2 Factory
   - Deploy Cache Manager
   - Deploy StylusDeployer

## Error Handling

```typescript
import { createPluginError } from '@cobuilders/hardhat-arb-utils';

throw createPluginError('Port 8547 is already in use');
```

## Key Files

| File | Purpose |
|------|---------|
| `hardhat-arb-node/src/index.ts` | Plugin definition |
| `hardhat-arb-node/src/tasks/start.ts` | Start task |
| `hardhat-arb-node/src/hook-handlers/config.ts` | Config hook |
| `hardhat-arb-utils/src/container/container-manager.ts` | Container lifecycle |
| `hardhat-arb-utils/src/container/docker-client.ts` | Docker CLI wrapper |
| `hardhat-arb-utils/src/errors/index.ts` | Error utilities |
