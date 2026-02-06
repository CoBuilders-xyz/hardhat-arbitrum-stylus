import type { HookContext, NetworkHooks } from 'hardhat/types/hooks';
import type { ChainType, NetworkConnection } from 'hardhat/types/network';

import { getHre } from './hre.js';
import { getHookHttpPort, getHookWsPort } from './hook-state.js';
import {
  generateTempContainerName,
  registerTempContainer,
  getActiveTempContainer,
  setActiveTempContainer,
  isTempContainerRunning,
  cleanupTempContainer,
} from '../temp-node.js';

/** Track temporary containers per connection for cleanup */
const tempContainersPerConnection = new WeakMap<
  NetworkConnection<ChainType | string>,
  string
>();

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
          // Check if we already have an active temp container
          const activeContainer = getActiveTempContainer();
          if (
            activeContainer &&
            (await isTempContainerRunning(activeContainer))
          ) {
            // Reuse existing temp container
            tempContainerName = activeContainer;
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
                registerTempContainer(tempContainerName);
                setActiveTempContainer(tempContainerName);

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
        await cleanupTempContainer(tempContainerName);
        tempContainersPerConnection.delete(networkConnection);
      }

      return next(context, networkConnection);
    },
  };

  return handlers;
};
