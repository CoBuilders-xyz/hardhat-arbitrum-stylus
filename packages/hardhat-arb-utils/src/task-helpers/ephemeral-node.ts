import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import {
  DockerClient,
  isLocalhostUrl,
  toDockerHostUrl,
} from '../container/index.js';
import { resolveExternalRpcUrl } from './resolve-rpc.js';
import { generateNetworkName } from './network-name.js';

/**
 * Context provided to the work function inside withEphemeralNode.
 */
export interface EphemeralNodeContext {
  /** RPC URL to reach the node (host-reachable) */
  rpcUrl: string;
  /** Whether an external network is being used (vs ephemeral) */
  isExternal: boolean;
  /** Container-mode options (only relevant for Docker-based workflows) */
  container: {
    /** Docker network name (only set in ephemeral + container mode) */
    network?: string;
    /** Temp container name (only set in ephemeral mode) */
    nodeContainerName?: string;
    /** RPC endpoint reachable from inside a Docker container */
    rpcEndpoint?: string;
    /** Whether --add-host=host.docker.internal:host-gateway is needed */
    useHostGateway?: boolean;
  };
}

/**
 * Options for withEphemeralNode.
 */
export interface EphemeralNodeOptions {
  /** Context label for log messages (e.g., "compilation", "deployment") */
  context: string;
  /** Docker network name prefix (e.g., "stylus-compile-net-") */
  networkPrefix: string;
  /** Whether the workflow uses Docker containers (needs Docker network) */
  needsDockerNetwork: boolean;
  /** Function to generate a temp container name */
  generateTempContainerName: () => string;
  /** Function to register a temp container for cleanup */
  registerTempContainer: (name: string) => void;
  /** Function to clean up a temp container */
  cleanupTempContainer: (name: string) => Promise<void>;
  /** Function to generate a random port */
  generateRandomPort: () => number;
}

/**
 * Execute work with an ephemeral Arbitrum node, handling the full lifecycle:
 * 1. Resolve external RPC or start ephemeral node
 * 2. Create Docker network if needed
 * 3. Run the work function
 * 4. Clean up temp node and Docker network
 *
 * @param hre - Hardhat runtime environment
 * @param options - Configuration for the ephemeral node
 * @param work - The work function to execute with the node context
 * @returns The result of the work function
 */
export async function withEphemeralNode<T>(
  hre: HardhatRuntimeEnvironment,
  options: EphemeralNodeOptions,
  work: (ctx: EphemeralNodeContext) => Promise<T>,
): Promise<T> {
  const externalRpcUrl = await resolveExternalRpcUrl(hre, options.context);

  const needsEphemeral = !externalRpcUrl;
  const needsNetwork = options.needsDockerNetwork && needsEphemeral;

  let dockerNetworkName: string | null = null;
  let tempContainerName: string | null = null;
  const client = needsNetwork ? new DockerClient() : null;

  // Create Docker network if needed
  if (needsNetwork) {
    dockerNetworkName = generateNetworkName(options.networkPrefix);
    console.log(`Creating Docker network: ${dockerNetworkName}...`);
    await client!.createNetwork(dockerNetworkName);
  }

  // Start ephemeral node or use external RPC
  let rpcUrl: string;

  if (externalRpcUrl) {
    rpcUrl = externalRpcUrl;
    console.log(`Using external network: ${rpcUrl}`);
  } else {
    const httpPort = options.generateRandomPort();
    const wsPort = httpPort + 1;
    rpcUrl = `http://localhost:${httpPort}`;

    console.log(`Starting Arbitrum node for ${options.context}...`);
    try {
      tempContainerName = options.generateTempContainerName();
      options.registerTempContainer(tempContainerName);

      await hre.tasks.getTask(['arb:node', 'start']).run({
        quiet: true,
        detach: true,
        name: tempContainerName,
        httpPort,
        wsPort,
        dockerNetwork: dockerNetworkName ?? '',
      });
      console.log('Node started.');
    } catch (error) {
      // Cleanup on failure
      if (dockerNetworkName && client) {
        try {
          await client.removeNetwork(dockerNetworkName);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  // Build the container context for Docker-based workflows
  let containerCtx: EphemeralNodeContext['container'] = {};

  if (externalRpcUrl) {
    if (isLocalhostUrl(externalRpcUrl)) {
      containerCtx = {
        rpcEndpoint: toDockerHostUrl(externalRpcUrl),
        useHostGateway: true,
      };
    } else {
      containerCtx = { rpcEndpoint: externalRpcUrl };
    }
  } else if (dockerNetworkName) {
    containerCtx = {
      network: dockerNetworkName,
      nodeContainerName: tempContainerName!,
    };
  }

  const ctx: EphemeralNodeContext = {
    rpcUrl,
    isExternal: externalRpcUrl !== null,
    container: containerCtx,
  };

  try {
    return await work(ctx);
  } finally {
    if (tempContainerName) {
      console.log(`\nStopping Arbitrum node...`);
      await options.cleanupTempContainer(tempContainerName);
    }

    if (dockerNetworkName && client) {
      console.log('Removing Docker network...');
      try {
        await client.removeNetwork(dockerNetworkName);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
