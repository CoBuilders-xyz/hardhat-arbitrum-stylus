import {
  createWalletClient,
  http,
  type Hex,
  type Chain,
  type WalletClient,
  type HttpTransport,
  encodeFunctionData,
  keccak256,
  getAddress,
} from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';

import { createPluginError } from '@cobuilders/hardhat-arb-utils';

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
 * Create a custom chain for the local Arbitrum node
 */
function createLocalArbitrumChain(
  rpcUrl: string,
  chainId: number = 412346,
): Chain {
  return {
    id: chainId,
    name: 'Arbitrum Local',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [rpcUrl] },
    },
  };
}

/**
 * Create a wallet client for sending transactions
 */
export function createNodeClient(
  rpcUrl: string,
  privateKey: Hex,
): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
  const account = privateKeyToAccount(privateKey);
  const chain = createLocalArbitrumChain(rpcUrl);

  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
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

  // Wait for receipt to get contract address
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1,
    }),
  });

  const result = (await response.json()) as {
    result: { contractAddress: Hex } | null;
  };

  if (!result.result?.contractAddress) {
    throw createPluginError('Failed to get contract address from receipt');
  }

  return { txHash, contractAddress: result.result.contractAddress };
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
 * Send a raw signed transaction (for CREATE2 factory)
 */
export async function sendRawTransaction(
  rpcUrl: string,
  signedTx: Hex,
): Promise<Hex> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signedTx],
      id: 1,
    }),
  });

  const result = (await response.json()) as { result?: Hex; error?: unknown };
  if (!result.result) {
    throw createPluginError(
      `Failed to send raw transaction: ${JSON.stringify(result.error)}`,
    );
  }

  return result.result;
}

/**
 * Get contract code at an address
 */
export async function getCode(rpcUrl: string, address: Hex): Promise<Hex> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [address, 'latest'],
      id: 1,
    }),
  });

  const result = (await response.json()) as { result: Hex };
  return result.result;
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

/**
 * Compute CREATE2 address
 */
export function computeCreate2Address(
  factory: Hex,
  salt: Hex,
  initCode: Hex,
): Hex {
  const initCodeHash = keccak256(initCode);
  const data = ('0xff' +
    factory.slice(2) +
    salt.slice(2) +
    initCodeHash.slice(2)) as Hex;
  const hash = keccak256(data);
  return ('0x' + hash.slice(-40)) as Hex;
}

/**
 * Wait for a transaction receipt
 */
export async function waitForReceipt(
  rpcUrl: string,
  txHash: Hex,
  timeout: number = 30000,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    const result = (await response.json()) as {
      result: { status: Hex } | null;
    };

    if (result.result) {
      return result.result.status === '0x1';
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}
