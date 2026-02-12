import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import { createPluginError } from '../errors/index.js';

/**
 * Resolve external RPC URL from --network flag.
 * Returns null if no external network is specified (default network).
 *
 * @param hre - The Hardhat Runtime Environment
 * @param context - Description of the operation (e.g. "compilation", "deployment") used in error messages
 */
export async function resolveExternalRpcUrl(
  hre: HardhatRuntimeEnvironment,
  context: string,
): Promise<string | null> {
  const networkName = hre.globalOptions.network;
  if (networkName === undefined || networkName === 'default') {
    return null;
  }

  const networkConfig = hre.config.networks[networkName];
  if (networkConfig === undefined) {
    throw createPluginError(
      `Network "${networkName}" is not defined in hardhat.config.`,
    );
  }

  if (networkConfig.type !== 'http') {
    throw createPluginError(
      `Network "${networkName}" is not an HTTP network. ` +
        `Only HTTP networks are supported for Stylus ${context}.`,
    );
  }

  return networkConfig.url.getUrl();
}
