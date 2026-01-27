import type { HookContext, NetworkHooks } from 'hardhat/types/hooks';
import type { ChainType, NetworkConnection } from 'hardhat/types/network';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import { getHre } from './hre.js';
import { getHookHttpPort, getHookWsPort } from './hook-state.js';

/** Prefix for temporary containers created by the hook */
const TEMP_CONTAINER_PREFIX = 'nitro-devnode-tmp-';

/** Track temporary containers per connection for cleanup */
const tempContainersPerConnection = new WeakMap<
  NetworkConnection<ChainType | string>,
  string
>();

/** Track all temp containers globally for process exit cleanup */
const allTempContainers = new Set<string>();

/** Track if we have started a temp container for this process */
let activeTempContainer: string | null = null;

/** Register process exit handler once */
let exitHandlerRegistered = false;

function registerExitHandler(): void {
  if (exitHandlerRegistered) return;
  exitHandlerRegistered = true;

  const cleanup = async () => {
    if (allTempContainers.size === 0) return;

    const client = new DockerClient();
    for (const containerName of allTempContainers) {
      try {
        const containerId = await client.findByName(containerName);
        if (containerId) {
          await client.stop(containerId);
          await client.remove(containerId, true);
        }
      } catch {
        // Ignore cleanup errors during exit
      }
    }
    allTempContainers.clear();
    activeTempContainer = null;
  };

  // Handle graceful shutdown
  process.on('beforeExit', () => void cleanup());
  process.on('SIGINT', () => void cleanup().then(() => process.exit(130)));
  process.on('SIGTERM', () => void cleanup().then(() => process.exit(143)));
}

/**
 * Generate a random container name for hook-started nodes
 */
function generateTempContainerName(): string {
  const randomId = Math.random().toString(36).substring(2, 10);
  return `${TEMP_CONTAINER_PREFIX}${randomId}`;
}

/**
 * Check if our temp container is still running
 */
async function isTempContainerRunning(containerName: string): Promise<boolean> {
  const client = new DockerClient();
  const containerId = await client.findByName(containerName);
  if (!containerId) return false;
  return client.isRunning(containerId);
}

/**
 * Check if the arb-node is running by trying to connect to it
 */
async function isNodeRunning(rpcUrl: string): Promise<boolean> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Normalize URL for comparison (localhost and 127.0.0.1 are equivalent)
 */
function normalizeUrl(url: string): string {
  return url.replace('localhost', '127.0.0.1');
}

export default async (): Promise<Partial<NetworkHooks>> => {
  const handlers: Partial<NetworkHooks> = {
    async newConnection<ChainTypeT extends ChainType | string>(
      context: HookContext,
      next: (
        nextContext: HookContext,
      ) => Promise<NetworkConnection<ChainTypeT>>,
    ): Promise<NetworkConnection<ChainTypeT>> {
      // Get the random hook ports (same as used in config hook)
      const hookHttpPort = getHookHttpPort();
      const hookWsPort = getHookWsPort();
      const hookRpcUrl = `http://127.0.0.1:${hookHttpPort}`;

      // Check if connecting to the default network
      const defaultNetwork = context.config.networks.default;
      let tempContainerName: string | undefined;

      if (defaultNetwork?.type === 'http') {
        const networkUrl = await defaultNetwork.url.getUrl();

        // Check if this is a connection to our hook network (random port)
        if (normalizeUrl(networkUrl) === normalizeUrl(hookRpcUrl)) {
          // Register exit handler for cleanup
          registerExitHandler();

          // Check if we already have an active temp container
          if (
            activeTempContainer &&
            (await isTempContainerRunning(activeTempContainer))
          ) {
            // Reuse existing temp container
            tempContainerName = activeTempContainer;
          } else {
            // Check if our hook port has a node running (from previous run)
            const nodeRunning = await isNodeRunning(hookRpcUrl);

            if (!nodeRunning) {
              // Need to start a new temp container
              const hre = getHre();
              if (hre) {
                // Generate a temporary container name
                tempContainerName = generateTempContainerName();

                // Track for cleanup
                allTempContainers.add(tempContainerName);
                activeTempContainer = tempContainerName;

                // Start the node on the random hook ports
                await hre.tasks.getTask(['arb:node', 'start']).run({
                  quiet: true,
                  detach: true,
                  stylusReady: false,
                  name: tempContainerName,
                  httpPort: hookHttpPort,
                  wsPort: hookWsPort,
                });
              }
            }
          }
        }
      }

      const connection = await next(context);

      // Track the temp container for cleanup on close
      if (tempContainerName) {
        tempContainersPerConnection.set(connection, tempContainerName);
      }

      return connection;
    },

    async closeConnection<ChainTypeT extends ChainType | string>(
      context: HookContext,
      networkConnection: NetworkConnection<ChainTypeT>,
      next: (
        nextContext: HookContext,
        nextNetworkConnection: NetworkConnection<ChainTypeT>,
      ) => Promise<void>,
    ): Promise<void> {
      // Clean up temp container if one was created for this connection
      const tempContainerName =
        tempContainersPerConnection.get(networkConnection);

      if (tempContainerName) {
        const client = new DockerClient();
        const containerId = await client.findByName(tempContainerName);

        if (containerId) {
          try {
            await client.stop(containerId);
            await client.remove(containerId, true);
          } catch {
            // Ignore cleanup errors
          }
        }

        tempContainersPerConnection.delete(networkConnection);
        allTempContainers.delete(tempContainerName);

        // Clear active temp container if this was it
        if (activeTempContainer === tempContainerName) {
          activeTempContainer = null;
        }
      }

      return next(context, networkConnection);
    },
  };

  return handlers;
};
