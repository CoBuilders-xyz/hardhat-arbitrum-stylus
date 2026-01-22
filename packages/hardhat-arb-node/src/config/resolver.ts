import type { ArbNodeConfig, ArbNodeUserConfig } from './types.js';

import { DEFAULT_ARB_NODE_CONFIG } from './defaults.js';

/**
 * Resolve user-provided config with defaults.
 */
export function resolveArbNodeConfig(
  userConfig?: ArbNodeUserConfig,
): ArbNodeConfig {
  return {
    image: userConfig?.image ?? DEFAULT_ARB_NODE_CONFIG.image,
    tag: userConfig?.tag ?? DEFAULT_ARB_NODE_CONFIG.tag,
    httpPort: userConfig?.httpPort ?? DEFAULT_ARB_NODE_CONFIG.httpPort,
    wsPort: userConfig?.wsPort ?? DEFAULT_ARB_NODE_CONFIG.wsPort,
    chainId: userConfig?.chainId ?? DEFAULT_ARB_NODE_CONFIG.chainId,
    devAccount: DEFAULT_ARB_NODE_CONFIG.devAccount,
  };
}
