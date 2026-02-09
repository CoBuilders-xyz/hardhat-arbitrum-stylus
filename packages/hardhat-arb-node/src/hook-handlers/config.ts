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
import { getHookHttpPort } from './hook-state.js';

export default async (): Promise<Partial<ConfigHooks>> => {
  const handlers: Partial<ConfigHooks> = {
    extendUserConfig: async (
      config: HardhatUserConfig,
      next: (nextConfig: HardhatUserConfig) => Promise<HardhatUserConfig>,
    ): Promise<HardhatUserConfig> => {
      const extendedConfig = await next(config);

      const nodeUserConfig = config.stylus?.node;
      const chainId =
        nodeUserConfig?.chainId ?? DEFAULT_ARB_NODE_CONFIG.chainId;

      const networks: Record<string, NetworkUserConfig> =
        extendedConfig.networks ?? {};

      // Use the hook's random port for the default network
      // This ensures complete decoupling from task nodes
      const hookHttpPort = getHookHttpPort();

      const arbNodeNetwork: HttpNetworkUserConfig = {
        type: 'http',
        url: `http://127.0.0.1:${hookHttpPort}`,
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
        stylus: {
          ...resolvedConfig.stylus,
          node: resolveArbNodeConfig(userConfig.stylus?.node),
        },
      };
    },
  };

  return handlers;
};
