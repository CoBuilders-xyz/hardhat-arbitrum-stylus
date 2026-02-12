import fs from 'node:fs';
import path from 'node:path';

import {
  type Hex,
  createChain,
  createWalletClientFromKey,
  getTransactionReceipt,
  encodeAbiParameters,
} from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

/**
 * Result of a contract deployment.
 */
export interface DeployResult {
  /** Deployed contract address */
  address: Hex;
  /** Deployment transaction hash */
  txHash: Hex;
}

/**
 * A compiled Solidity artifact read from the artifacts directory.
 */
export interface SolidityArtifact {
  contractName: string;
  bytecode: Hex;
  abi: AbiItem[];
}

/** Minimal ABI item type */
interface AbiItem {
  type: string;
  name?: string;
  inputs?: AbiInput[];
  [key: string]: unknown;
}

interface AbiInput {
  name: string;
  type: string;
  [key: string]: unknown;
}

/**
 * Find a Solidity artifact by contract name in the artifacts directory.
 * Expects the name without .sol extension (e.g. "SolidityCounter").
 */
export function findSolidityArtifact(
  artifactsDir: string,
  contractName: string,
): SolidityArtifact | null {
  if (!fs.existsSync(artifactsDir)) {
    return null;
  }

  return scanForArtifact(artifactsDir, contractName);
}

function scanForArtifact(
  dir: string,
  contractName: string,
): SolidityArtifact | null {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const result = scanForArtifact(fullPath, contractName);
      if (result) return result;
      continue;
    }

    if (!entry.name.endsWith('.json') || entry.name.includes('.dbg.')) {
      continue;
    }

    try {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as {
        contractName?: string;
        bytecode?: string;
        abi?: AbiItem[];
      };

      if (
        content.contractName === contractName &&
        content.bytecode &&
        content.abi
      ) {
        if (content.bytecode === '0x' || content.bytecode === '') {
          continue;
        }

        return {
          contractName: content.contractName,
          bytecode: content.bytecode as Hex,
          abi: content.abi,
        };
      }
    } catch {
      // Skip files that can't be parsed
    }
  }

  return null;
}

/**
 * Parse constructor arg strings into typed values based on ABI types.
 * Follows Foundry convention: args are passed as strings and coerced.
 */
function parseConstructorArg(value: string, abiType: string): unknown {
  // Integer types (uint256, int256, uint8, etc.)
  if (abiType.startsWith('uint') || abiType.startsWith('int')) {
    return BigInt(value);
  }

  // Boolean
  if (abiType === 'bool') {
    return value === 'true' || value === '1';
  }

  // Address - pass through
  if (abiType === 'address') {
    return value;
  }

  // Bytes types - pass through as hex
  if (abiType.startsWith('bytes')) {
    return value as Hex;
  }

  // String - pass through
  return value;
}

/**
 * Encode constructor arguments and append to bytecode.
 */
function encodeConstructorArgs(abi: AbiItem[], args: string[]): Hex | null {
  const constructor = abi.find((item) => item.type === 'constructor');

  if (!constructor?.inputs || constructor.inputs.length === 0) {
    if (args.length > 0) {
      throw createPluginError(
        `Contract has no constructor arguments but ${args.length} were provided`,
      );
    }
    return null;
  }

  if (args.length !== constructor.inputs.length) {
    const expected = constructor.inputs
      .map((i) => `${i.name}: ${i.type}`)
      .join(', ');
    throw createPluginError(
      `Constructor expects ${constructor.inputs.length} argument(s) (${expected}) but ${args.length} were provided`,
    );
  }

  const types = constructor.inputs.map((input) => ({
    type: input.type,
    name: input.name,
  }));

  const values = args.map((arg, i) =>
    parseConstructorArg(arg, constructor.inputs![i].type),
  );

  return encodeAbiParameters(types, values);
}

/**
 * Deploy a Solidity contract with optional constructor arguments.
 */
export async function deploySolidityContract(
  rpcUrl: string,
  privateKey: Hex,
  chainId: number,
  artifact: SolidityArtifact,
  constructorArgs: string[],
): Promise<DeployResult> {
  const chain = createChain({
    chainId,
    name: 'Arbitrum Local',
    rpcUrl,
  });

  const client = createWalletClientFromKey(rpcUrl, privateKey, chain);

  // Encode constructor args and append to bytecode
  let deployData = artifact.bytecode;
  if (constructorArgs.length > 0) {
    const encodedArgs = encodeConstructorArgs(artifact.abi, constructorArgs);
    if (encodedArgs) {
      deployData = (artifact.bytecode + encodedArgs.slice(2)) as Hex;
    }
  }

  const txHash = await client.sendTransaction({
    data: deployData,
    chain: null,
  });

  const receipt = await getTransactionReceipt(rpcUrl, txHash);

  if (!receipt?.contractAddress) {
    throw createPluginError(
      'Failed to get contract address from deployment receipt',
    );
  }

  return { address: receipt.contractAddress, txHash };
}
