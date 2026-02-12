/**
 * Web3 client utilities for creating viem wallet clients.
 */

import {
  createWalletClient,
  http,
  type Hex,
  type Chain,
  type WalletClient,
  type HttpTransport,
} from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';

import type { ChainConfig } from './types.js';

/**
 * Create a custom chain configuration.
 */
export function createChain(config: ChainConfig): Chain {
  return {
    id: config.chainId,
    name: config.name,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [config.rpcUrl] },
    },
  };
}

/**
 * Create a wallet client from a private key.
 */
export function createWalletClientFromKey(
  rpcUrl: string,
  privateKey: Hex,
  chain: Chain,
): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
}
