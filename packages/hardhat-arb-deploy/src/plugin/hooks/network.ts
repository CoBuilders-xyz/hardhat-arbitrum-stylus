import type { HookContext, NetworkHooks } from 'hardhat/types/hooks';
import type { ChainType, NetworkConnection } from 'hardhat/types/network';

import {
  deployStylusViem,
  type ViemHelpers,
  type StylusDeployRuntimeConfig,
} from '../../services/deployers/viem-stylus.js';
import { buildStylusAssertions } from '../../services/assertions/stylus-assertions.js';

/**
 * Stylus artifact format identifier used to detect WASM artifacts.
 */
const STYLUS_ARTIFACT_FORMAT = 'hh3-stylus-artifact-1';

/**
 * Full viem helpers shape (from hardhat-viem).
 */
interface OriginalViem extends ViemHelpers {
  deployContract: (
    contractName: string,
    constructorArgs?: readonly unknown[],
    config?: Record<string, unknown>,
  ) => Promise<unknown>;
  [key: string]: unknown;
}

const networkHook = async (): Promise<Partial<NetworkHooks>> => {
  const handlers: Partial<NetworkHooks> = {
    async newConnection<ChainTypeT extends ChainType | string>(
      context: HookContext,
      next: (
        nextContext: HookContext,
      ) => Promise<NetworkConnection<ChainTypeT>>,
    ): Promise<NetworkConnection<ChainTypeT>> {
      const connection = await next(context);

      // Read stylus deploy config from resolved config
      const stylusConfig = (
        context.config as {
          stylus?: { deploy?: { useHostToolchain?: boolean } };
        }
      ).stylus;

      const deployConfig: StylusDeployRuntimeConfig = {
        projectRoot: context.config.paths.root,
        useHostToolchain: stylusConfig?.deploy?.useHostToolchain ?? false,
      };

      const connRecord = connection as unknown as Record<string, unknown>;

      // Lazy accessor for original viem helpers.
      // Resolves hook ordering: viem may not exist yet when our hook runs,
      // but it will always exist by the time the user calls a method.
      const getViem = (): OriginalViem => {
        const v = connRecord.viem as OriginalViem | undefined;
        if (!v) {
          throw new Error(
            'hardhat-viem is required for stylusViem. ' +
              'Install @nomicfoundation/hardhat-viem and add it to your plugins.',
          );
        }
        return v;
      };

      /**
       * Stylus-aware deployContract.
       * Routes Solidity artifacts to the original viem, Stylus to cargo stylus deploy.
       */
      const deployContract = async (
        contractName: string,
        constructorArgs?: readonly unknown[],
        deployContractConfig?: Record<string, unknown>,
      ): Promise<unknown> => {
        const viem = getViem();

        // Check artifact format to determine contract type
        let artifactFormat: string | null = null;
        try {
          const artifact = await context.artifacts.readArtifact(contractName);
          artifactFormat = (artifact as { _format?: string })._format ?? null;
        } catch {
          // No artifact — might be an uncompiled Stylus contract
        }

        // Solidity artifact → delegate to original viem
        if (
          artifactFormat !== null &&
          artifactFormat !== STYLUS_ARTIFACT_FORMAT
        ) {
          return viem.deployContract(
            contractName,
            constructorArgs,
            deployContractConfig,
          );
        }

        // Try Stylus deployment (discovers from source, exports ABI if needed).
        // If discovery fails (not a Stylus contract), fall back to original viem
        // so the user gets the standard "artifact not found" error.
        try {
          return await deployStylusViem(
            viem,
            connection.provider,
            context.artifacts,
            contractName,
            deployConfig,
            constructorArgs,
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('not found in contracts/')
          ) {
            return viem.deployContract(
              contractName,
              constructorArgs,
              deployContractConfig,
            );
          }
          throw error;
        }
      };

      // Expose stylusViem on the connection.
      // Proxies all methods from the original viem, overrides deployContract
      // and revert/revertWith assertions for Arbitrum node compatibility.
      connRecord.stylusViem = new Proxy(
        {},
        {
          get(_, prop) {
            if (prop === 'deployContract') return deployContract;
            const viem = connRecord.viem as Record<string, unknown> | undefined;
            if (prop === 'assertions' && viem?.assertions) {
              return buildStylusAssertions(
                viem.assertions as Record<string, unknown>,
              );
            }
            return viem?.[prop as string];
          },
        },
      );

      return connection;
    },
  };

  return handlers;
};

export default networkHook;
