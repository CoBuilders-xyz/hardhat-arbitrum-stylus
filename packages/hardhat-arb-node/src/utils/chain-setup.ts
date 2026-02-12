import { type Hex, getAddress } from '@cobuilders/hardhat-arb-utils';

import { HARDHAT_ACCOUNTS } from '../config/defaults.js';
import {
  becomeChainOwner,
  setL1PricePerUnit,
  sendEth,
} from './transactions.js';

/**
 * Perform essential chain setup (chain owner + L1 price)
 */
export async function performEssentialSetup(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<void> {
  if (!quiet) {
    console.log('Setting up chain ownership...');
  }

  await becomeChainOwner(rpcUrl, privateKey);

  if (!quiet) {
    console.log('Setting L1 price per unit to 0...');
  }

  await setL1PricePerUnit(rpcUrl, privateKey, 0n);
}

/**
 * Prefund all Hardhat accounts with 10 ETH each
 */
export async function prefundAccounts(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<void> {
  if (!quiet) {
    console.log('Prefunding accounts...');
  }

  // 10 ETH in wei (devAccount has ~1000 ETH, reserving rest for operations)
  const amount = 10000000000000000000n;

  for (const account of HARDHAT_ACCOUNTS) {
    // Use getAddress to ensure proper EIP-55 checksum
    await sendEth(rpcUrl, privateKey, getAddress(account.address), amount);
  }
}
