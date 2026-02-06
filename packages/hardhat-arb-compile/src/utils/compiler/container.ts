import { execSync, spawn } from 'node:child_process';
import path from 'node:path';

import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import type { ProgressCallback } from '../exec.js';
import { parseAbiFromSolidity } from '../abi/export.js';
import {
  buildStylusArtifact,
  saveStylusArtifact,
  type StylusArtifact,
} from '../artifacts/stylus-artifact.js';
import { getCompileImageName } from './image-builder.js';

import type { CompileResult } from './types.js';

export type { CompileResult } from './types.js';

/** Docker volume name for persisting rustup toolchains between container runs */
export const RUSTUP_VOLUME_NAME = 'stylus-compile-rustup';

/** Docker volume name for persisting cargo registry between container runs */
export const CARGO_VOLUME_NAME = 'stylus-compile-cargo';

/**
 * Options for container compilation.
 */
export interface ContainerCompileOptions {
  /** Callback for progress updates during compilation */
  onProgress?: ProgressCallback;
  /** Directory to save artifacts to */
  artifactsDir?: string;
  /** Docker network name for node communication */
  network: string;
  /** Node container name (used as hostname for RPC) */
  nodeContainerName: string;
}

/**
 * Check if a Docker volume exists.
 */
export function volumeExists(volumeName: string): boolean {
  try {
    execSync(`docker volume inspect ${volumeName}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove the cache volumes used for Stylus compilation.
 * Returns true if any volumes were removed.
 */
export function cleanCacheVolumes(): {
  removed: string[];
  notFound: string[];
} {
  const removed: string[] = [];
  const notFound: string[] = [];

  for (const volumeName of [RUSTUP_VOLUME_NAME, CARGO_VOLUME_NAME]) {
    try {
      execSync(`docker volume rm ${volumeName}`, { stdio: 'ignore' });
      removed.push(volumeName);
    } catch {
      notFound.push(volumeName);
    }
  }

  return { removed, notFound };
}

/**
 * Ensure the Docker volumes exist for caching.
 * Returns info about which volumes were created.
 */
export function ensureVolumes(): {
  created: string[];
  existing: string[];
} {
  const created: string[] = [];
  const existing: string[] = [];

  for (const volumeName of [RUSTUP_VOLUME_NAME, CARGO_VOLUME_NAME]) {
    const exists = volumeExists(volumeName);
    if (exists) {
      existing.push(volumeName);
    } else {
      execSync(`docker volume create ${volumeName}`, { stdio: 'ignore' });
      created.push(volumeName);
    }
  }

  return { created, existing };
}

/**
 * Run a command inside a compile container and capture output.
 * Uses Docker volumes to persist rustup and cargo data between runs.
 */
async function runInContainer(
  image: string,
  contractPath: string,
  command: string[],
  options: ContainerCompileOptions,
): Promise<{ stdout: string; stderr: string }> {
  const containerName = `stylus-compile-tmp-${Math.random().toString(36).slice(2, 8)}`;

  return new Promise((resolve, reject) => {
    const args = [
      'run',
      '--rm',
      '--name',
      containerName,
      '--network',
      options.network,
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
    ];

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

  // RPC endpoint uses the node container name as hostname via Docker network
  const rpcEndpoint = `http://${options.nodeContainerName}:8547`;

  // Install the specific toolchain and wasm32 target
  // These are cached in the Docker volume, so only slow on first use
  options.onProgress?.(`Preparing toolchain ${toolchain}...`);

  // Track if we're downloading (first use) vs using cache
  let downloadHintShown = false;
  const toolchainProgress: ProgressCallback = (line) => {
    // Detect download patterns from rustup output
    if (
      line.includes('downloading component') ||
      line.includes('info: downloading')
    ) {
      if (!downloadHintShown) {
        options.onProgress?.(
          `Downloading toolchain ${toolchain}... (first use, will be cached)`,
        );
        downloadHintShown = true;
      }
    }
    // Pass through to original progress handler
    options.onProgress?.(line);
  };

  try {
    await runInContainer(
      imageName,
      contractPath,
      ['rustup', 'toolchain', 'install', toolchain],
      {
        ...options,
        onProgress: toolchainProgress,
      },
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

  options.onProgress?.('Compiling contract...');

  // Run cargo stylus check with the specific toolchain and endpoint flag
  try {
    await runInContainer(
      imageName,
      contractPath,
      ['cargo', `+${toolchain}`, 'stylus', 'check', '--endpoint', rpcEndpoint],
      options,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw createPluginError(
      `Stylus check failed for ${packageName}:\n${message}`,
    );
  }

  options.onProgress?.('Running cargo stylus build...');

  // Run cargo stylus build with the specific toolchain (doesn't need endpoint)
  try {
    await runInContainer(
      imageName,
      contractPath,
      ['cargo', `+${toolchain}`, 'stylus', 'build'],
      options,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw createPluginError(
      `Stylus build failed for ${packageName}:\n${message}`,
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
    const result = await runInContainer(
      imageName,
      contractPath,
      ['cargo', `+${toolchain}`, 'stylus', 'export-abi'],
      options,
    );
    solidityInterface = result.stdout;
  } catch {
    // ABI export may fail if contract doesn't support it
    solidityInterface = '';
  }

  const abi = parseAbiFromSolidity(solidityInterface);

  return buildStylusArtifact(contractName, abi, wasmPath);
}
