import path from 'node:path';

import {
  type ProgressCallback,
  getCompileImageName,
  runInStylusContainer,
  runStylusContainerCommand,
  ensureContainerToolchain,
  parseAbiFromSolidity,
} from '@cobuilders/hardhat-arb-utils/stylus';

import {
  buildStylusArtifact,
  saveStylusArtifact,
  type StylusArtifact,
} from '../artifacts/stylus-artifact.js';

import type { CompileResult } from './types.js';

export type { CompileResult } from './types.js';

/**
 * Options for container compilation.
 */
export interface ContainerCompileOptions {
  /** Callback for progress updates during compilation */
  onProgress?: ProgressCallback;
  /** Directory to save artifacts to */
  artifactsDir?: string;
  /** Docker network name for node communication (ephemeral node mode) */
  network?: string;
  /** Node container name (used as hostname for RPC in ephemeral node mode) */
  nodeContainerName?: string;
  /** Explicit RPC endpoint for external network mode */
  rpcEndpoint?: string;
  /** Add --add-host=host.docker.internal:host-gateway for localhost access */
  useHostGateway?: boolean;
  /** Set used to avoid duplicate toolchain setup in the same task run */
  preparedToolchains?: Set<string>;
}

/**
 * Compile a Stylus contract using a Docker container.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param toolchain - The Rust toolchain version (e.g., "1.83.0")
 * @param packageName - The package name from Cargo.toml
 * @param options - Container compilation options
 * @returns Compilation result with path to WASM output
 * @throws HardhatPluginError if compilation fails
 */
export async function compileContainer(
  contractPath: string,
  toolchain: string,
  packageName: string,
  options: ContainerCompileOptions,
): Promise<CompileResult> {
  const imageName = getCompileImageName();

  // RPC endpoint: use explicit endpoint if provided, otherwise derive from container name
  const rpcEndpoint =
    options.rpcEndpoint ?? `http://${options.nodeContainerName}:8547`;

  const containerOpts = {
    ...options,
    containerPrefix: 'stylus-compile-tmp',
  };

  await ensureContainerToolchain(
    imageName,
    contractPath,
    toolchain,
    containerOpts,
  );

  options.onProgress?.('Compiling contract...');

  // Run cargo stylus check with the specific toolchain and endpoint flag
  await runStylusContainerCommand(
    imageName,
    contractPath,
    ['cargo', `+${toolchain}`, 'stylus', 'check', '--endpoint', rpcEndpoint],
    `Stylus check failed for ${packageName}`,
    containerOpts,
  );

  options.onProgress?.('Running cargo stylus build...');

  // Run cargo stylus build with the specific toolchain (doesn't need endpoint)
  await runStylusContainerCommand(
    imageName,
    contractPath,
    ['cargo', `+${toolchain}`, 'stylus', 'build'],
    `Stylus build failed for ${packageName}`,
    containerOpts,
  );

  // The WASM output is at target/wasm32-unknown-unknown/release/{name}.wasm
  // Note: Cargo converts hyphens to underscores in the output filename
  const wasmName = packageName.replace(/-/g, '_');
  const wasmPath = path.join(
    contractPath,
    'target',
    'wasm32-unknown-unknown',
    'release',
    `${wasmName}.wasm`,
  );

  const result: CompileResult = {
    wasmPath,
    success: true,
  };

  // Generate and save artifact if artifactsDir is provided
  if (options.artifactsDir) {
    try {
      // For artifact generation, we run export-abi in the container too
      options.onProgress?.('Exporting ABI...');

      const artifact = await generateStylusArtifactContainer(
        imageName, // Already includes tag (e.g., "stylus-compile:latest")
        toolchain,
        contractPath,
        packageName,
        wasmPath,
        options,
      );

      const artifactPath = await saveStylusArtifact(
        options.artifactsDir,
        artifact,
      );
      result.artifactPath = artifactPath;
    } catch (error) {
      // Don't fail the compilation if artifact generation fails
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Warning: Failed to generate artifact: ${message}`);
    }
  }

  return result;
}

/**
 * Generate a Stylus artifact using container for ABI export.
 */
async function generateStylusArtifactContainer(
  imageName: string,
  toolchain: string,
  contractPath: string,
  contractName: string,
  wasmPath: string,
  options: ContainerCompileOptions,
): Promise<StylusArtifact> {
  // Export ABI from the contract using container with the specific toolchain
  let solidityInterface = '';
  try {
    const result = await runInStylusContainer(
      imageName,
      contractPath,
      ['cargo', `+${toolchain}`, 'stylus', 'export-abi'],
      { ...options, containerPrefix: 'stylus-compile-tmp' },
    );
    solidityInterface = result.stdout;
  } catch {
    // ABI export may fail if contract doesn't support it
    solidityInterface = '';
  }

  const abi = parseAbiFromSolidity(solidityInterface);

  return buildStylusArtifact(contractName, abi, wasmPath);
}
