import path from 'node:path';

import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import {
  execWithProgress,
  type ProgressCallback,
} from '@cobuilders/hardhat-arb-utils/stylus';
import {
  generateStylusArtifact,
  saveStylusArtifact,
} from '../stylus-artifacts/stylus-artifact.js';
import type { CompileResult } from './types.js';

export type { CompileResult } from './types.js';

/**
 * Options for host compilation.
 */
export interface CompileOptions {
  /** Callback for progress updates during compilation */
  onProgress?: ProgressCallback;
  /** Directory to save artifacts to */
  artifactsDir?: string;
  /** RPC endpoint for cargo stylus check (e.g. http://localhost:12345) */
  endpoint?: string;
}

/**
 * Compile a Stylus contract using the host Rust toolchain.
 *
 * Note: Toolchain validation should be done upfront via validateAllToolchains()
 * before calling this function.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param toolchain - The Rust toolchain version (e.g., "1.93.0")
 * @param packageName - The package name from Cargo.toml
 * @param options - Optional compilation options
 * @returns Compilation result with path to WASM output
 * @throws HardhatPluginError if compilation fails
 */
export async function compileHost(
  contractPath: string,
  toolchain: string,
  packageName: string,
  options?: CompileOptions,
): Promise<CompileResult> {
  // Run cargo stylus check
  const endpointFlag = options?.endpoint
    ? ` --endpoint ${options.endpoint}`
    : '';
  try {
    await execWithProgress(
      `cargo +${toolchain} stylus check${endpointFlag}`,
      { cwd: contractPath },
      options?.onProgress,
    );
  } catch (error) {
    const stderr =
      error instanceof Error && 'stderr' in error
        ? (error as { stderr: string }).stderr
        : String(error);
    throw createPluginError(
      `Stylus check failed for ${packageName}:\n${stderr}`,
    );
  }

  // Run cargo stylus build (always builds in release mode)
  try {
    await execWithProgress(
      `cargo +${toolchain} stylus build`,
      { cwd: contractPath },
      options?.onProgress,
    );
  } catch (error) {
    const stderr =
      error instanceof Error && 'stderr' in error
        ? (error as { stderr: string }).stderr
        : String(error);
    throw createPluginError(
      `Stylus build failed for ${packageName}:\n${stderr}`,
    );
  }

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
  if (options?.artifactsDir) {
    const artifact = await generateStylusArtifact(
      contractPath,
      packageName,
      wasmPath,
      toolchain,
      options?.onProgress,
    );
    const artifactPath = await saveStylusArtifact(
      options.artifactsDir,
      artifact,
    );
    result.artifactPath = artifactPath;
  }

  return result;
}
