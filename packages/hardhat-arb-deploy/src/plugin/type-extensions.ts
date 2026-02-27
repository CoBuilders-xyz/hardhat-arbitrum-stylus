import 'hardhat/types/config';
import 'hardhat/types/network';

import type {
  StylusDeployConfig,
  StylusDeployUserConfig,
} from '../config/types.js';

declare module 'hardhat/types/config' {
  export interface StylusUserConfig {
    deploy?: StylusDeployUserConfig;
  }

  export interface StylusConfig {
    deploy: StylusDeployConfig;
  }
}

/**
 * Stylus-aware viem helpers added to the network connection.
 * Proxies all original viem methods and adds Stylus deploy routing.
 */
export interface StylusViemHelpers {
  deployContract(
    contractName: string,
    constructorArgs?: readonly unknown[],
    config?: Record<string, unknown>,
  ): Promise<any>;
  getPublicClient(...args: any[]): Promise<any>;
  getWalletClients(...args: any[]): Promise<any>;
  getContractAt(...args: any[]): Promise<any>;
  sendDeploymentTransaction(...args: any[]): Promise<any>;
}

declare module 'hardhat/types/network' {
  export interface NetworkConnection<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ChainTypeT extends ChainType | string = DefaultChainType,
  > {
    stylusViem: StylusViemHelpers;
  }
}
