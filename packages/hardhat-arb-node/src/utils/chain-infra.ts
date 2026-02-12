import type { Hex } from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import {
  CACHE_MANAGER_BYTECODE,
  CREATE2_FACTORY_TX,
  DEFAULT_SALT,
  STYLUS_DEPLOYER_BYTECODE,
} from '../constants/bytecode.js';
import {
  sendEth,
  sendRawTransaction,
  deployContract,
  addWasmCacheManager,
  getCode,
  CREATE2_FACTORY,
  deployViaCreate2,
} from './transactions.js';

/**
 * Deploy CREATE2 factory
 */
export async function deployCreate2Factory(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<void> {
  // Check if already deployed
  const code = await getCode(rpcUrl, CREATE2_FACTORY.ADDRESS);
  if (code !== '0x') {
    if (!quiet) {
      console.log('CREATE2 factory already deployed');
    }
    return;
  }

  if (!quiet) {
    console.log('Deploying CREATE2 factory...');
  }

  // Fund the deployer address
  await sendEth(
    rpcUrl,
    privateKey,
    CREATE2_FACTORY.DEPLOYER,
    1000000000000000000n,
  ); // 1 ETH

  // Send the pre-signed deployment transaction
  await sendRawTransaction(rpcUrl, CREATE2_FACTORY_TX);

  // Verify deployment
  const deployedCode = await getCode(rpcUrl, CREATE2_FACTORY.ADDRESS);
  if (deployedCode === '0x') {
    throw createPluginError('Failed to deploy CREATE2 factory');
  }
}

/**
 * Deploy Cache Manager contract
 */
export async function deployCacheManager(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<Hex> {
  if (!quiet) {
    console.log('Deploying Cache Manager...');
  }

  const { contractAddress } = await deployContract(
    rpcUrl,
    privateKey,
    CACHE_MANAGER_BYTECODE,
  );

  if (!quiet) {
    console.log(`Cache Manager deployed at: ${contractAddress}`);
    console.log('Registering Cache Manager as WASM cache manager...');
  }

  await addWasmCacheManager(rpcUrl, privateKey, contractAddress);

  return contractAddress;
}

/**
 * Deploy StylusDeployer contract
 */
export async function deployStylusDeployer(
  rpcUrl: string,
  privateKey: Hex,
  quiet: boolean,
): Promise<Hex> {
  if (!quiet) {
    console.log('Deploying StylusDeployer...');
  }

  const { contractAddress } = await deployViaCreate2(
    rpcUrl,
    privateKey,
    DEFAULT_SALT,
    STYLUS_DEPLOYER_BYTECODE,
  );

  // Verify deployment
  const code = await getCode(rpcUrl, contractAddress);
  if (code === '0x') {
    throw createPluginError('Failed to deploy StylusDeployer');
  }

  if (!quiet) {
    console.log(`StylusDeployer deployed at: ${contractAddress}`);
  }

  return contractAddress;
}
