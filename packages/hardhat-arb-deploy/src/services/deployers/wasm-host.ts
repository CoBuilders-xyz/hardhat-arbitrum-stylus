import type { Hex } from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';
import { execWithProgress } from '@cobuilders/hardhat-arb-utils/stylus';

import type { WasmDeployResult, ProgressCallback } from './types.js';

/**
 * Options for host WASM deployment.
 */
export interface HostDeployOptions {
  /** Callback for progress updates */
  onProgress?: ProgressCallback;
  /** Constructor arguments to pass to cargo stylus deploy */
  constructorArgs?: string[];
}

/**
 * Parse the deployed contract address from cargo stylus deploy output.
 * The output typically contains a line like:
 *   deployed code at address: 0x...
 */
export function parseDeployedAddress(output: string): Hex | null {
  // Match patterns like "deployed code at address: 0x..." or "contract deployed at 0x..."
  const patterns = [
    /deployed code at address:\s*(0x[0-9a-fA-F]{40})/i,
    /contract deployed at\s*(0x[0-9a-fA-F]{40})/i,
    /deployed at[:\s]+(0x[0-9a-fA-F]{40})/i,
    // Fallback: any 0x address in the output
    /(0x[0-9a-fA-F]{40})/,
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match?.[1]) {
      return match[1] as Hex;
    }
  }

  return null;
}

/**
 * Deploy a Stylus contract using the host cargo-stylus toolchain.
 *
 * Runs `cargo stylus deploy` against the given RPC endpoint.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param toolchain - The Rust toolchain version (e.g., "1.83.0")
 * @param packageName - The package name from Cargo.toml
 * @param rpcUrl - RPC endpoint for the Arbitrum node
 * @param privateKey - Private key for the deployer account
 * @param options - Optional deployment options
 * @returns Deployment result with the contract address
 */
export async function deployHost(
  contractPath: string,
  toolchain: string,
  packageName: string,
  rpcUrl: string,
  privateKey: Hex,
  options?: HostDeployOptions,
): Promise<WasmDeployResult> {
  const parts = [
    `cargo +${toolchain} stylus deploy`,
    `--endpoint ${rpcUrl}`,
    `--private-key ${privateKey}`,
    `--no-verify`,
  ];

  if (options?.constructorArgs && options.constructorArgs.length > 0) {
    parts.push('--constructor-args', ...options.constructorArgs);
  }

  const command = parts.join(' ');

  try {
    const result = await execWithProgress(
      command,
      { cwd: contractPath },
      options?.onProgress,
    );

    const combinedOutput = result.stdout + '\n' + result.stderr;
    const address = parseDeployedAddress(combinedOutput);

    if (!address) {
      throw createPluginError(
        `Deploy succeeded but could not parse contract address for ${packageName}.\nOutput: ${combinedOutput}`,
      );
    }

    return { address };
  } catch (error) {
    if (error instanceof Error && 'stderr' in error) {
      throw createPluginError(
        `Stylus deploy failed for ${packageName}:\n${(error as { stderr: string }).stderr}`,
      );
    }
    throw error;
  }
}
