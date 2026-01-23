import type { HookContext, NetworkHooks } from 'hardhat/types/hooks';
import type { ChainType, NetworkConnection } from 'hardhat/types/network';

import { getHre } from './hre.js';

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
      const config = context.config.arbNode;
      const rpcUrl = `http://127.0.0.1:${config.httpPort}`;

      // Check if connecting to the default network (our arb-node)
      const defaultNetwork = context.config.networks.default;
      if (defaultNetwork?.type === 'http') {
        const networkUrl = await defaultNetwork.url.getUrl();

        // Compare normalized URLs (localhost === 127.0.0.1)
        if (normalizeUrl(networkUrl) === normalizeUrl(rpcUrl)) {
          // Check if node is already running
          const running = await isNodeRunning(rpcUrl);

          if (!running) {
            // Get the captured HRE to access tasks
            const hre = getHre();
            if (hre) {
              // Use the actual task to start the node
              await hre.tasks.getTask(['arb:node', 'start']).run({
                quiet: true,
                detach: true,
                stylusReady: false,
                persist: false,
              });
            }
          }
        }
      }

      return next(context);
    },
  };

  return handlers;
};
