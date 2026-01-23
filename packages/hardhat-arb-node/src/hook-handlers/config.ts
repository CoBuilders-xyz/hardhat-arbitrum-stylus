import type { ConfigHooks } from 'hardhat/types/hooks';
import type {
  HardhatUserConfig,
  HttpNetworkUserConfig,
  NetworkUserConfig,
} from 'hardhat/types/config';

import {
  DEFAULT_ARB_NODE_CONFIG,
  HARDHAT_ACCOUNTS,
} from '../config/defaults.js';
import { resolveArbNodeConfig } from '../config/resolver.js';

export default async (): Promise<Partial<ConfigHooks>> => {
  const handlers: Partial<ConfigHooks> = {
    extendUserConfig: async (
      config: HardhatUserConfig,
      next: (nextConfig: HardhatUserConfig) => Promise<HardhatUserConfig>,
    ): Promise<HardhatUserConfig> => {
      const extendedConfig = await next(config);

      const arbNodeUserConfig = config.arbNode;
      const httpPort =
        arbNodeUserConfig?.httpPort ?? DEFAULT_ARB_NODE_CONFIG.httpPort;
      const chainId =
        arbNodeUserConfig?.chainId ?? DEFAULT_ARB_NODE_CONFIG.chainId;

      const networks: Record<string, NetworkUserConfig> =
        extendedConfig.networks ?? {};

      // Override the default network to use arb-node via HTTP
      const arbNodeNetwork: HttpNetworkUserConfig = {
        type: 'http',
        url: `http://127.0.0.1:${httpPort}`,
        chainId,
        accounts: HARDHAT_ACCOUNTS.map((acc) => acc.privateKey),
      };

      return {
        ...extendedConfig,
        networks: {
          ...networks,
          default: arbNodeNetwork,
        },
      };
    },

    resolveUserConfig: async (
      userConfig,
      resolveConfigurationVariable,
      next,
    ) => {
      const resolvedConfig = await next(
        userConfig,
        resolveConfigurationVariable,
      );

      return {
        ...resolvedConfig,
        arbNode: resolveArbNodeConfig(userConfig.arbNode),
      };
    },
  };

  return handlers;
};
