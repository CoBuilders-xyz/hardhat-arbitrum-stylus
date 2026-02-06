import path from 'node:path';

import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import type { ProgressCallback } from '../exec.js';
import { saveStylusArtifact } from '../artifacts/stylus-artifact.js';

/**
 * Result of a container compilation.
 */
export interface CompileResult {
  /** Path to the compiled WASM file */
  wasmPath: string;
  /** Whether compilation succeeded */
  success: boolean;
  /** Path to the generated artifact JSON (if artifactsDir was provided) */
  artifactPath?: string;
}

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
 * Run a command inside a compile container.
 * Returns stdout/stderr on success, throws on failure.
 */
async function runInContainer(
  image: string,
  tag: string,
  contractPath: string,
  command: string[],
  options: ContainerCompileOptions,
): Promise<{ stdout: string; stderr: string }> {
  // Generate a unique container name
  const containerName = `stylus-compile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Run container using docker run directly with proper output handling
  const result = await runContainerForeground(
    image,
    tag,
    containerName,
    options.network,
    contractPath,
    command,
    options.onProgress,
  );

  return result;
}

/**
 * Run a container in foreground mode and capture output.
 * This handles the case where we need to see the output and wait for completion.
 */
async function runContainerForeground(
  image: string,
  tag: string,
  containerName: string,
  network: string,
  contractPath: string,
  command: string[],
  onProgress?: ProgressCallback,
): Promise<{ stdout: string; stderr: string }> {
  const { spawn } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    const args = [
      'run',
      '--rm', // Auto-remove when done
      '--name',
      containerName,
      '--network',
      network,
      '-v',
      `${contractPath}:/workspace:rw`,
      '-w',
      '/workspace',
      `${image}:${tag}`,
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
      // Stream progress updates
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && onProgress) {
          onProgress(trimmed);
        }
      }
    });

    proc.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      // Cargo outputs to stderr
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && onProgress) {
          onProgress(trimmed);
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
  const imageName = 'stylus-compile';

  // RPC endpoint uses the node container name as hostname via Docker network
  const rpcEndpoint = `http://${options.nodeContainerName}:8547`;

  options.onProgress?.('Running cargo stylus check...');

  // Run cargo stylus check with endpoint flag
  try {
    await runInContainer(
      imageName,
      toolchain,
      contractPath,
      ['cargo', 'stylus', 'check', '--endpoint', rpcEndpoint],
      options,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw createPluginError(
      `Stylus check failed for ${packageName}:\n${message}`,
    );
  }

  options.onProgress?.('Running cargo stylus build...');

  // Run cargo stylus build (doesn't need endpoint)
  try {
    await runInContainer(
      imageName,
      toolchain,
      contractPath,
      ['cargo', 'stylus', 'build'],
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
        imageName,
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
): Promise<{
  _format: 'hh3-stylus-artifact-1';
  contractName: string;
  sourceName: string;
  abi: unknown[];
  bytecode: string;
  deployedBytecode: string;
  linkReferences: Record<string, never>;
  deployedLinkReferences: Record<string, never>;
}> {
  // Export ABI from the contract using container
  let solidityInterface = '';
  try {
    const result = await runInContainer(
      imageName,
      toolchain,
      contractPath,
      ['cargo', 'stylus', 'export-abi'],
      options,
    );
    solidityInterface = result.stdout;
  } catch {
    // ABI export may fail if contract doesn't support it
    solidityInterface = '';
  }

  // Parse the Solidity interface to JSON ABI
  const abi = parseAbiFromSolidity(solidityInterface);

  // Read the WASM file and convert to hex
  const fs = await import('node:fs/promises');
  const wasmBuffer = await fs.readFile(wasmPath);
  const wasmHex = '0x' + wasmBuffer.toString('hex');

  const sourceName = `contracts/${contractName}`;

  return {
    _format: 'hh3-stylus-artifact-1',
    contractName,
    sourceName,
    abi,
    bytecode: wasmHex,
    deployedBytecode: wasmHex,
    linkReferences: {},
    deployedLinkReferences: {},
  };
}

/**
 * Parse a Solidity interface string into JSON ABI format.
 * Simplified version that handles basic function and event signatures.
 */
function parseAbiFromSolidity(solidityInterface: string): unknown[] {
  if (!solidityInterface.trim()) {
    return [];
  }

  const abi: unknown[] = [];
  const lines = solidityInterface.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse function declarations
    const funcMatch = trimmed.match(
      /function\s+(\w+)\s*\(([^)]*)\)\s*(?:external|public|view|pure|payable|\s)*(?:returns\s*\(([^)]*)\))?/,
    );
    if (funcMatch) {
      const [, name, inputs, outputs] = funcMatch;
      abi.push({
        type: 'function',
        name,
        inputs: parseParams(inputs),
        outputs: outputs ? parseParams(outputs) : [],
        stateMutability: trimmed.includes('view')
          ? 'view'
          : trimmed.includes('pure')
            ? 'pure'
            : trimmed.includes('payable')
              ? 'payable'
              : 'nonpayable',
      });
    }

    // Parse event declarations
    const eventMatch = trimmed.match(/event\s+(\w+)\s*\(([^)]*)\)/);
    if (eventMatch) {
      const [, name, inputs] = eventMatch;
      abi.push({
        type: 'event',
        name,
        inputs: parseEventParams(inputs),
        anonymous: false,
      });
    }
  }

  return abi;
}

/**
 * Parse function parameter string into ABI format.
 */
function parseParams(params: string): Array<{ name: string; type: string }> {
  if (!params.trim()) return [];

  return params.split(',').map((param, index) => {
    const parts = param.trim().split(/\s+/);
    const type = parts[0] || 'uint256';
    const name = parts[1] || `arg${index}`;
    return { name, type };
  });
}

/**
 * Parse event parameter string into ABI format.
 */
function parseEventParams(
  params: string,
): Array<{ name: string; type: string; indexed: boolean }> {
  if (!params.trim()) return [];

  return params.split(',').map((param, index) => {
    const trimmed = param.trim();
    const indexed = trimmed.includes('indexed');
    const parts = trimmed.replace('indexed', '').trim().split(/\s+/);
    const type = parts[0] || 'uint256';
    const name = parts[1] || `arg${index}`;
    return { name, type, indexed };
  });
}
