import type { ConfigHooks } from 'hardhat/types/hooks';

import { resolveArbNodeConfig } from '../config/resolver.js';

export default async (): Promise<Partial<ConfigHooks>> => {
  const handlers: Partial<ConfigHooks> = {
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
