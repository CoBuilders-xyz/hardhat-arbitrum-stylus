# Hooks

Hooks run at specific points in Hardhat's lifecycle. We use three hooks in `hardhat-arb-node`.

---

## Config Hook

**When:** During configuration loading, before anything else runs.

**What we do:**

1. **`extendUserConfig`** — Adds a `default` network pointing to a random port. This port is used by hook-started nodes (separate from manually started nodes).

2. **`resolveUserConfig`** — Takes the user's `arbNode` config and resolves it with defaults.

```typescript
extendUserConfig: async (config, next) => {
  const extendedConfig = await next(config);

  // Random port for hook-started nodes
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
```

---

## HRE Hook

**When:** After the Hardhat Runtime Environment is created.

**What we do:** Capture the HRE reference so other hooks can access it.

```typescript
let capturedHre: HardhatRuntimeEnvironment | undefined;

export function getHre() {
  return capturedHre;
}

export default async () => ({
  created: async (_context, hre) => {
    capturedHre = hre;
  },
});
```

**Why we need this:** The network hook needs to call `hre.tasks.getTask()` to start nodes, but network hooks only receive `context`, not `hre`. By capturing HRE when it's created, we can access it later from the network hook.

---

## Network Hook

**When:** When connecting to or disconnecting from a network.

**What we do:**

1. **`newConnection`** — When connecting to the default network, check if a node is running. If not, start a temporary container on the random hook port.

2. **`closeConnection`** — When disconnecting, clean up any temporary container we started.

```typescript
async newConnection(context, next) {
  const hookHttpPort = getHookHttpPort();
  const hookRpcUrl = `http://127.0.0.1:${hookHttpPort}`;

  // Check if connecting to our default network
  if (networkUrl === hookRpcUrl) {
    const nodeRunning = await isNodeRunning(hookRpcUrl);

    if (!nodeRunning) {
      const hre = getHre();  // ← From hre hook
      if (hre) {
        const tempContainerName = generateTempContainerName();

        await hre.tasks.getTask(['arb:node', 'start']).run({
          quiet: true,
          detach: true,
          name: tempContainerName,
          httpPort: hookHttpPort,
        });
      }
    }
  }

  return next(context);
},
```

The hook also registers process exit handlers (`SIGINT`, `SIGTERM`) to clean up containers if the process is killed.

---

## Error Handling

Always use `createPluginError` from utils:

```typescript
import { createPluginError } from '@cobuilders/hardhat-arb-utils';

throw createPluginError('Port 8547 is already in use');

// With cause
throw createPluginError('Failed to start', originalError);
```
