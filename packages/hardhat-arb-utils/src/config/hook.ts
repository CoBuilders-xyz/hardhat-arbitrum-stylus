import type { ConfigHooks } from 'hardhat/types/hooks';

/**
 * Create a config hook handler that resolves a Stylus sub-config section.
 *
 * The `stylus` property on HardhatConfig is declared by the plugin packages
 * (hardhat-arb-node, hardhat-arb-compile, hardhat-arb-deploy) via module
 * augmentation. This utility uses type assertions to avoid depending on those
 * type extensions.
 *
 * @param key - The key under `stylus` (e.g., 'compile', 'deploy')
 * @param resolver - Function to resolve user config into resolved config
 * @returns An async function that returns the config hook handlers
 */
export function createStylusConfigHook<TUser, TResolved>(
  key: string,
  resolver: (userConfig?: TUser) => TResolved,
): () => Promise<Partial<ConfigHooks>> {
  return async (): Promise<Partial<ConfigHooks>> => {
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

        const resolvedStylus =
          (resolvedConfig as unknown as Record<string, unknown>).stylus ?? {};
        const userStylus =
          (
            userConfig as unknown as Record<
              string,
              Record<string, unknown> | undefined
            >
          ).stylus ?? {};

        return {
          ...resolvedConfig,
          stylus: {
            ...(resolvedStylus as Record<string, unknown>),
            [key]: resolver(userStylus[key] as TUser | undefined),
          },
        };
      },
    };

    return handlers;
  };
}
