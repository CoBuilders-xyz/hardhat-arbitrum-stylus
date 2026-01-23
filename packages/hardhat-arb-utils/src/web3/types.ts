/**
 * Web3 types - Re-exports from viem for convenience.
 */

export type { Hex, Chain, WalletClient, HttpTransport } from "viem";

export type { PrivateKeyAccount } from "viem/accounts";

/**
 * Chain configuration options.
 */
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
}
