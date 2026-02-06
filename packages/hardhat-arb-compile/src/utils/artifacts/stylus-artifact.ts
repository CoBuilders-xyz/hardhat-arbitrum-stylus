import fs from 'node:fs/promises';
import path from 'node:path';

import { exportStylusAbi, parseAbiFromSolidity } from '../abi/export.js';
import type { ProgressCallback } from '../exec.js';

/**
 * Stylus artifact format compatible with Hardhat's artifact system.
 */
export interface StylusArtifact {
  _format: 'hh3-stylus-artifact-1';
  contractName: string;
  sourceName: string;
  abi: unknown[];
  bytecode: string;
  deployedBytecode: string;
  linkReferences: Record<string, never>;
  deployedLinkReferences: Record<string, never>;
}

/**
 * Generate a Stylus artifact from compiled WASM and exported ABI.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param contractName - Name of the contract (from Cargo.toml)
 * @param wasmPath - Path to the compiled WASM file
 * @param toolchain - The Rust toolchain version
 * @param onProgress - Optional callback for progress updates
 * @returns The generated artifact
 */
export async function generateStylusArtifact(
  contractPath: string,
  contractName: string,
  wasmPath: string,
  toolchain: string,
  onProgress?: ProgressCallback,
): Promise<StylusArtifact> {
  // Export ABI from the contract
  const solidityInterface = await exportStylusAbi(
    contractPath,
    toolchain,
    onProgress,
  );

  // Parse the Solidity interface to JSON ABI
  const abi = parseAbiFromSolidity(solidityInterface);

  // Read the WASM file and convert to hex
  const wasmBuffer = await fs.readFile(wasmPath);
  const wasmHex = '0x' + wasmBuffer.toString('hex');

  // Compute the source name (relative path from contracts dir)
  // e.g., "contracts/stylus-counter" or just the contract name
  const sourceName = `contracts/${contractName}`;

  return {
    _format: 'hh3-stylus-artifact-1',
    contractName,
    sourceName,
    abi,
    bytecode: wasmHex,
    deployedBytecode: wasmHex, // For Stylus, these are the same
    linkReferences: {},
    deployedLinkReferences: {},
  };
}

/**
 * Save a Stylus artifact to the artifacts directory.
 *
 * Creates the directory structure: artifacts/contracts/{contractName}/{contractName}.json
 *
 * @param artifactsDir - The root artifacts directory
 * @param artifact - The artifact to save
 * @returns The path where the artifact was saved
 */
export async function saveStylusArtifact(
  artifactsDir: string,
  artifact: StylusArtifact,
): Promise<string> {
  // Create directory structure: artifacts/contracts/{contractName}/
  const contractDir = path.join(
    artifactsDir,
    'contracts',
    artifact.contractName,
  );
  await fs.mkdir(contractDir, { recursive: true });

  // Save artifact as {contractName}.json
  const artifactPath = path.join(contractDir, `${artifact.contractName}.json`);
  await fs.writeFile(artifactPath, JSON.stringify(artifact, null, 2));

  return artifactPath;
}
