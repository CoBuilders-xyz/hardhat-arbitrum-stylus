import {
  type Hex,
  type Chain,
  type WalletClient,
  type HttpTransport,
  type PrivateKeyAccount,
  encodeFunctionData,
  getAddress,
  createChain,
  createWalletClientFromKey,
  getTransactionReceipt,
  computeCreate2Address,
} from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

// Re-export web3 utilities for backwards compatibility
export {
  sendRawTransaction,
  getCode,
  waitForReceipt,
  computeCreate2Address,
} from '@cobuilders/hardhat-arb-utils';

/**
 * Arbitrum precompile addresses (checksummed)
 */
export const PRECOMPILES: { ARB_DEBUG: Hex; ARB_OWNER: Hex } = {
  ARB_DEBUG: getAddress('0x00000000000000000000000000000000000000ff'),
  ARB_OWNER: getAddress('0x0000000000000000000000000000000000000070'),
};

/**
 * CREATE2 factory addresses (checksummed)
 */
export const CREATE2_FACTORY: { ADDRESS: Hex; DEPLOYER: Hex } = {
  ADDRESS: getAddress('0x4e59b44847b379578588920ca78fbf26c0b4956c'),
  DEPLOYER: getAddress('0x3fab184622dc19b6109349b94811493bf2a45362'),
};

/**
 * Default chain ID for local Arbitrum node
 */
const LOCAL_CHAIN_ID = 412346;

/**
 * Create a wallet client for the local Arbitrum node
 */
export function createNodeClient(
  rpcUrl: string,
  privateKey: Hex,
): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
  const chain = createChain({
    chainId: LOCAL_CHAIN_ID,
    name: 'Arbitrum Local',
    rpcUrl,
  });

  return createWalletClientFromKey(rpcUrl, privateKey, chain);
}

/**
 * Call becomeChainOwner() on the ArbDebug precompile
 */
export async function becomeChainOwner(
  rpcUrl: string,
  privateKey: Hex,
): Promise<Hex> {
  const client = createNodeClient(rpcUrl, privateKey);

  const data = encodeFunctionData({
    abi: [
      {
        name: 'becomeChainOwner',
        type: 'function',
        inputs: [],
        outputs: [],
      },
    ],
    functionName: 'becomeChainOwner',
  });

  return client.sendTransaction({
    to: PRECOMPILES.ARB_DEBUG,
    data,
    chain: null,
  });
}

/**
 * Set L1 price per unit to 0 on the ArbOwner precompile
 */
export async function setL1PricePerUnit(
  rpcUrl: string,
  privateKey: Hex,
  value: bigint = 0n,
): Promise<Hex> {
  const client = createNodeClient(rpcUrl, privateKey);

  const data = encodeFunctionData({
    abi: [
      {
        name: 'setL1PricePerUnit',
        type: 'function',
        inputs: [{ name: 'pricePerUnit', type: 'uint256' }],
        outputs: [],
      },
    ],
    functionName: 'setL1PricePerUnit',
    args: [value],
  });

  return client.sendTransaction({
    to: PRECOMPILES.ARB_OWNER,
    data,
    chain: null,
  });
}

/**
 * Deploy a contract with the given bytecode
 */
export async function deployContract(
  rpcUrl: string,
  privateKey: Hex,
  bytecode: Hex,
): Promise<{ txHash: Hex; contractAddress: Hex }> {
  const client = createNodeClient(rpcUrl, privateKey);

  const txHash = await client.sendTransaction({
    data: bytecode,
    chain: null,
  });

  const receipt = await getTransactionReceipt(rpcUrl, txHash);

  if (!receipt?.contractAddress) {
    throw createPluginError('Failed to get contract address from receipt');
  }

  return { txHash, contractAddress: receipt.contractAddress };
}

/**
 * Send ETH to an address
 */
export async function sendEth(
  rpcUrl: string,
  privateKey: Hex,
  to: Hex,
  value: bigint,
): Promise<Hex> {
  const client = createNodeClient(rpcUrl, privateKey);

  return client.sendTransaction({
    to,
    value,
    chain: null,
  });
}

/**
 * Register a WASM cache manager on the ArbOwner precompile
 */
export async function addWasmCacheManager(
  rpcUrl: string,
  privateKey: Hex,
  cacheManagerAddress: Hex,
): Promise<Hex> {
  const client = createNodeClient(rpcUrl, privateKey);

  const data = encodeFunctionData({
    abi: [
      {
        name: 'addWasmCacheManager',
        type: 'function',
        inputs: [{ name: 'manager', type: 'address' }],
        outputs: [],
      },
    ],
    functionName: 'addWasmCacheManager',
    args: [cacheManagerAddress],
  });

  return client.sendTransaction({
    to: PRECOMPILES.ARB_OWNER,
    data,
    chain: null,
  });
}

/**
 * Deploy contract via CREATE2 factory
 */
export async function deployViaCreate2(
  rpcUrl: string,
  privateKey: Hex,
  salt: Hex,
  initCode: Hex,
): Promise<{ txHash: Hex; contractAddress: Hex }> {
  const client = createNodeClient(rpcUrl, privateKey);

  // Concatenate salt + initCode for the factory call
  const data = (salt + initCode.slice(2)) as Hex;

  const txHash = await client.sendTransaction({
    to: CREATE2_FACTORY.ADDRESS,
    data,
    chain: null,
  });

  // Compute CREATE2 address
  const contractAddress = computeCreate2Address(
    CREATE2_FACTORY.ADDRESS,
    salt,
    initCode,
  );

  return { txHash, contractAddress };
}
