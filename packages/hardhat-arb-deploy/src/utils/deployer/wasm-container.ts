import { spawn } from 'node:child_process';

import type { Hex } from '@cobuilders/hardhat-arb-utils';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';
import {
  getCompileImageName,
  RUSTUP_VOLUME_NAME,
  CARGO_VOLUME_NAME,
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
}

/**
 * Run a command inside a container and capture output.
 * Reuses the compile image and volumes.
 */
async function runInContainer(
  image: string,
  contractPath: string,
  command: string[],
  options: ContainerDeployOptions,
): Promise<{ stdout: string; stderr: string }> {
  const containerName = `stylus-deploy-tmp-${Math.random().toString(36).slice(2, 8)}`;

  return new Promise((resolve, reject) => {
    const args = ['run', '--rm', '--name', containerName];

    if (options.network) {
      args.push('--network', options.network);
    }

    if (options.useHostGateway) {
      args.push('--add-host=host.docker.internal:host-gateway');
    }

    args.push(
      '-v',
      `${contractPath}:/workspace:rw`,
      '-v',
      `${RUSTUP_VOLUME_NAME}:/usr/local/rustup:rw`,
      '-v',
      `${CARGO_VOLUME_NAME}:/usr/local/cargo:rw`,
      '-w',
      '/workspace',
      image,
      ...command,
    );

    const proc = spawn('docker', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout += text;
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && options.onProgress) {
          options.onProgress(trimmed);
        }
      }
    });

    proc.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && options.onProgress) {
          options.onProgress(trimmed);
        }
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `Container command failed with exit code ${code}:\n${stderr || stdout}`,
          ),
        );
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to run container: ${err.message}`));
    });
  });
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

  // Ensure toolchain is ready (should be cached from compile step)
  options.onProgress?.(`Preparing toolchain ${toolchain}...`);

  try {
    await runInContainer(
      imageName,
      contractPath,
      ['rustup', 'toolchain', 'install', toolchain],
      options,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw createPluginError(
      `Failed to install toolchain ${toolchain}:\n${message}`,
    );
  }

  options.onProgress?.(`Adding wasm32 target for ${toolchain}...`);
  try {
    await runInContainer(
      imageName,
      contractPath,
      [
        'rustup',
        'target',
        'add',
        'wasm32-unknown-unknown',
        '--toolchain',
        toolchain,
      ],
      options,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw createPluginError(
      `Failed to add wasm32 target for ${toolchain}:\n${message}`,
    );
  }

  // Deploy the contract
  options.onProgress?.(`Deploying ${packageName}...`);

  try {
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

    const result = await runInContainer(
      imageName,
      contractPath,
      deployCmd,
      options,
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
    const message = error instanceof Error ? error.message : String(error);
    throw createPluginError(
      `Stylus deploy failed for ${packageName}:\n${message}`,
    );
  }
}
