# Architecture

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
    network: () => import('./hook-handlers/network.js'),
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

The node plugin uses three hook handlers that work together:

### Config Hook

Extends and validates configuration, and sets up the default network:

```typescript
// hook-handlers/config.ts
const handlers: Partial<ConfigHooks> = {
  extendUserConfig: async (config, next) => {
    const extendedConfig = await next(config);
    
    // Configure default network with random hook port
    const hookHttpPort = getHookHttpPort();
    const arbNodeNetwork: HttpNetworkUserConfig = {
      type: 'http',
      url: `http://127.0.0.1:${hookHttpPort}`,
      chainId,
      accounts: HARDHAT_ACCOUNTS.map((acc) => acc.privateKey),
    };

    return {
      ...extendedConfig,
      networks: { ...networks, default: arbNodeNetwork },
    };
  },

  resolveUserConfig: async (userConfig, resolveConfigurationVariable, next) => {
    const resolvedConfig = await next(userConfig, resolveConfigurationVariable);
    return {
      ...resolvedConfig,
      arbNode: resolveArbNodeConfig(userConfig.arbNode),
    };
  },
};
```

### HRE Hook

Captures the Hardhat Runtime Environment for use in the network hook:

```typescript
// hook-handlers/hre.ts
let capturedHre: HardhatRuntimeEnvironment | undefined;

export function getHre(): HardhatRuntimeEnvironment | undefined {
  return capturedHre;
}

export default async (): Promise<Partial<HardhatRuntimeEnvironmentHooks>> => ({
  created: async (_context, hre) => {
    capturedHre = hre;
  },
});
```

### Network Hook

Handles auto-start of temporary nodes when connecting to the default network:

```typescript
// hook-handlers/network.ts
const handlers: Partial<NetworkHooks> = {
  async newConnection(context, next) {
    // Check if connecting to the default network
    if (isDefaultNetwork && !nodeRunning) {
      // Start a temporary container with random port
      const tempContainerName = generateTempContainerName();
      await hre.tasks.getTask(['arb:node', 'start']).run({
        quiet: true,
        detach: true,
        stylusReady: false,
        name: tempContainerName,
        httpPort: hookHttpPort,
        wsPort: hookWsPort,
      });
    }
    return next(context);
  },

  async closeConnection(context, networkConnection, next) {
    // Cleanup temporary container
    if (tempContainer) {
      await client.stop(containerId);
      await client.remove(containerId, true);
    }
    return next(context, networkConnection);
  },
};
```

### Hook State Management

Random ports are generated once per process to decouple hook-started nodes from manually-started nodes:

```typescript
// hook-handlers/hook-state.ts
const MIN_PORT = 10000;
const MAX_PORT = 60000;

let hookHttpPort: number | null = null;
let hookWsPort: number | null = null;

export function getHookHttpPort(): number {
  if (hookHttpPort === null) {
    hookHttpPort = Math.floor(Math.random() * (MAX_PORT - MIN_PORT)) + MIN_PORT;
    hookWsPort = hookHttpPort + 1;
  }
  return hookHttpPort;
}
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

- Image pulling (if not present locally)
- Container lifecycle (start/stop/remove)
- Readiness checks (HTTP/TCP/exec)
- Managed container tracking

**DockerClient** wraps Docker CLI commands:

- `docker run`, `docker stop`, `docker rm`
- `docker logs`, `docker exec`
- `docker inspect`, `docker images`

## Chain Setup

When `arb:node start` runs:

```
┌─────────────────────────────────────────────────────────┐
│  1. Check if container already running                  │
│     └─ If yes: show message and exit                    │
├─────────────────────────────────────────────────────────┤
│  2. Check if ports are available                        │
│     └─ If in use: throw error                           │
├─────────────────────────────────────────────────────────┤
│  3. Start nitro-devnode container                       │
│     └─ Pull image if not present                        │
│     └─ Wait for RPC ready (HTTP readiness check)        │
├─────────────────────────────────────────────────────────┤
│  4. Essential setup (via precompiles)                   │
│     └─ becomeChainOwner() via ArbDebug (0x...ff)        │
│     └─ setL1PricePerUnit(0) via ArbOwner (0x...70)      │
├─────────────────────────────────────────────────────────┤
│  5. Prefund accounts                                    │
│     └─ Send 10 ETH to each of 20 Hardhat accounts       │
├─────────────────────────────────────────────────────────┤
│  6. If --stylus-ready:                                  │
│     └─ Deploy CREATE2 Factory (0x4e59b448...)           │
│     └─ Deploy Cache Manager                             │
│     └─ Register Cache Manager via addWasmCacheManager() │
│     └─ Deploy StylusDeployer via CREATE2               │
├─────────────────────────────────────────────────────────┤
│  7. Print startup info                                  │
│     └─ RPC endpoints, accounts, private keys            │
├─────────────────────────────────────────────────────────┤
│  8. If not --detach:                                    │
│     └─ Attach to container logs                         │
│     └─ Stop container on Ctrl+C                         │
└─────────────────────────────────────────────────────────┘
```

### Precompile Addresses

| Precompile | Address | Purpose |
|------------|---------|---------|
| ArbDebug | `0x00000000000000000000000000000000000000ff` | `becomeChainOwner()` |
| ArbOwner | `0x0000000000000000000000000000000000000070` | `setL1PricePerUnit()`, `addWasmCacheManager()` |

## Error Handling

All plugins use `HardhatPluginError` via the utility function:

```typescript
import { createPluginError } from '@cobuilders/hardhat-arb-utils';

// Creates a HardhatPluginError with plugin ID
throw createPluginError('Port 8547 is already in use');

// With cause for error chaining
throw createPluginError('Failed to deploy contract', originalError);
```

## Key Files

| File | Purpose |
|------|---------|
| `hardhat-arb-node/src/index.ts` | Plugin definition |
| `hardhat-arb-node/src/tasks/start.ts` | Start task with chain setup |
| `hardhat-arb-node/src/tasks/stop.ts` | Stop task |
| `hardhat-arb-node/src/tasks/status.ts` | Status task |
| `hardhat-arb-node/src/tasks/logs.ts` | Logs task |
| `hardhat-arb-node/src/hook-handlers/config.ts` | Config hook (default network) |
| `hardhat-arb-node/src/hook-handlers/hre.ts` | HRE capture hook |
| `hardhat-arb-node/src/hook-handlers/network.ts` | Auto-start network hook |
| `hardhat-arb-node/src/hook-handlers/hook-state.ts` | Random port state |
| `hardhat-arb-node/src/config/defaults.ts` | Default config and accounts |
| `hardhat-arb-node/src/utils/transactions.ts` | Chain setup transactions |
| `hardhat-arb-utils/src/container/container-manager.ts` | Container lifecycle |
| `hardhat-arb-utils/src/container/docker-client.ts` | Docker CLI wrapper |
| `hardhat-arb-utils/src/errors/index.ts` | Error utilities |
