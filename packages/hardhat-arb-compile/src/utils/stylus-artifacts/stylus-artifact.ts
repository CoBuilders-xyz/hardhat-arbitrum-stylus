import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { exportStylusAbi, parseAbiFromSolidity } from '../abi/export.js';
import type { ProgressCallback } from '@cobuilders/hardhat-arb-utils/stylus';

/**
 * Stylus artifact format, compatible with Hardhat artifacts.
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
 * Build a Stylus artifact from a pre-parsed ABI and WASM file.
 *
 * @param contractName - The name of the contract
 * @param abi - The parsed JSON ABI
 * @param wasmPath - Path to the compiled WASM file
 * @returns The generated artifact
 */
export async function buildStylusArtifact(
  contractName: string,
  abi: unknown[],
  wasmPath: string,
): Promise<StylusArtifact> {
  const wasmBuffer = await readFile(wasmPath);
  const wasmHex = '0x' + wasmBuffer.toString('hex');

  return {
    _format: 'hh3-stylus-artifact-1',
    contractName,
    sourceName: `contracts/${contractName}`,
    abi,
    bytecode: wasmHex,
    deployedBytecode: wasmHex,
    linkReferences: {},
    deployedLinkReferences: {},
  };
}

/**
 * Generate a Stylus artifact from a compiled contract using local toolchain.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param contractName - The name of the contract
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
  onProgress?.('Exporting ABI...');
  const solidityInterface = await exportStylusAbi(
    contractPath,
    toolchain,
    onProgress,
  );
  const abi = parseAbiFromSolidity(solidityInterface);

  return buildStylusArtifact(contractName, abi, wasmPath);
}

/**
 * Save a Stylus artifact to the artifacts directory.
 *
 * @param artifactsDir - The artifacts directory path
 * @param artifact - The artifact to save
 * @returns The path to the saved artifact file
 */
export async function saveStylusArtifact(
  artifactsDir: string,
  artifact: StylusArtifact,
): Promise<string> {
  // Create the artifact directory path: artifacts/contracts/{contractName}/{contractName}.json
  const contractDir = path.join(
    artifactsDir,
    'contracts',
    artifact.contractName,
  );

  // Ensure the directory exists
  await mkdir(contractDir, { recursive: true });

  // Write the artifact file
  const artifactPath = path.join(contractDir, `${artifact.contractName}.json`);
  await writeFile(artifactPath, JSON.stringify(artifact, null, 2));

  return artifactPath;
}
