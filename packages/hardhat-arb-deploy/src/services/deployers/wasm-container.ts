import type { Hex } from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';
import {
  getCompileImageName,
  runStylusContainerCommand,
  ensureContainerToolchain,
} from '@cobuilders/hardhat-arb-utils/stylus';

import { parseDeployedAddress } from './wasm-host.js';
import type { WasmDeployResult, ProgressCallback } from './types.js';

/**
 * Options for container WASM deployment.
 */
export interface ContainerDeployOptions {
  /** Callback for progress updates */
  onProgress?: ProgressCallback;
  /** Docker network name for node communication (ephemeral node mode) */
  network?: string;
  /** Node container name (used as hostname for RPC in ephemeral node mode) */
  nodeContainerName?: string;
  /** Explicit RPC endpoint for external network mode */
  rpcEndpoint?: string;
  /** Add --add-host=host.docker.internal:host-gateway for localhost access */
  useHostGateway?: boolean;
  /** Constructor arguments to pass to cargo stylus deploy */
  constructorArgs?: string[];
  /** Set used to avoid duplicate toolchain setup in the same task run */
  preparedToolchains?: Set<string>;
}

/**
 * Deploy a Stylus contract using a Docker container.
 *
 * Runs `cargo stylus deploy` inside the compile container, communicating
 * with the node via Docker network.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param toolchain - The Rust toolchain version (e.g., "1.83.0")
 * @param packageName - The package name from Cargo.toml
 * @param privateKey - Private key for the deployer account
 * @param options - Container deployment options
 * @returns Deployment result with the contract address
 */
export async function deployContainer(
  contractPath: string,
  toolchain: string,
  packageName: string,
  privateKey: Hex,
  options: ContainerDeployOptions,
): Promise<WasmDeployResult> {
  const imageName = getCompileImageName();
  const rpcEndpoint =
    options.rpcEndpoint ?? `http://${options.nodeContainerName}:8547`;

  const containerOpts = {
    ...options,
    containerPrefix: 'stylus-deploy-tmp',
  };

  await ensureContainerToolchain(
    imageName,
    contractPath,
    toolchain,
    containerOpts,
  );

  // Deploy the contract
  options.onProgress?.(`Deploying ${packageName}...`);

  const deployCmd = [
    'cargo',
    `+${toolchain}`,
    'stylus',
    'deploy',
    '--endpoint',
    rpcEndpoint,
    '--private-key',
    privateKey,
    '--no-verify',
  ];

  if (options.constructorArgs && options.constructorArgs.length > 0) {
    deployCmd.push('--constructor-args', ...options.constructorArgs);
  }

  const result = await runStylusContainerCommand(
    imageName,
    contractPath,
    deployCmd,
    `Stylus deploy failed for ${packageName}`,
    containerOpts,
  );

  const combinedOutput = result.stdout + '\n' + result.stderr;
  const address = parseDeployedAddress(combinedOutput);

  if (!address) {
    throw createPluginError(
      `Deploy succeeded but could not parse contract address for ${packageName}.\nOutput: ${combinedOutput}`,
    );
  }

  return { address };
}
