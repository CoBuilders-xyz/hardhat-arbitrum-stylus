import path from 'node:path';

import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import { execWithProgress, type ProgressCallback } from '../exec.js';
import { validateLocalToolchain } from '../toolchain/validator.js';

/**
 * Result of a local compilation.
 */
export interface CompileResult {
  /** Path to the compiled WASM file */
  wasmPath: string;
  /** Whether compilation succeeded */
  success: boolean;
}

/**
 * Options for local compilation.
 */
export interface CompileOptions {
  /** Callback for progress updates during compilation */
  onProgress?: ProgressCallback;
}

/**
 * Compile a Stylus contract using the local Rust toolchain.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param toolchain - The Rust toolchain version (e.g., "1.93.0")
 * @param packageName - The package name from Cargo.toml
 * @param options - Optional compilation options
 * @returns Compilation result with path to WASM output
 * @throws HardhatPluginError if compilation fails
 */
export async function compileLocal(
  contractPath: string,
  toolchain: string,
  packageName: string,
  options?: CompileOptions,
): Promise<CompileResult> {
  // Validate toolchain requirements
  await validateLocalToolchain(toolchain);

  // Run cargo stylus check
  try {
    await execWithProgress(
      `cargo +${toolchain} stylus check`,
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

  return {
    wasmPath,
    success: true,
  };
}
