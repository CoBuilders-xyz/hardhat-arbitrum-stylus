import type { ArbNodeConfig } from './types.js';

/**
 * Default configuration for the Arbitrum nitro-devnode.
 * Based on the official nitro-devnode setup.
 */
export const DEFAULT_ARB_NODE_CONFIG: ArbNodeConfig = {
  image: 'offchainlabs/nitro-node',
  tag: 'v3.7.1-926f1ab',
  httpPort: 8547,
  wsPort: 8548,
};

/**
 * Container name used for the nitro-devnode.
 */
export const CONTAINER_NAME = 'nitro-devnode';
