import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import { getStylusPackageName } from './cargo-parser.js';
import { parseToolchain } from './toolchain-parser.js';
import type { DiscoveryOptions, StylusContractInfo } from './types.js';

export type { DiscoveryOptions, StylusContractInfo } from './types.js';

/**
 * Recursively find all directories containing Cargo.toml files.
 */
async function findCargoDirectories(dir: string): Promise<string[]> {
  const results: string[] = [];

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  // Check if this directory has a Cargo.toml
  const hasCargoToml = entries.some(
    (e) => e.isFile() && e.name === 'Cargo.toml',
  );
  if (hasCargoToml) {
    results.push(dir);
  }

  // Recursively search subdirectories (skip target and hidden dirs)
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'target' || entry.name.startsWith('.')) continue;

    const subResults = await findCargoDirectories(path.join(dir, entry.name));
    results.push(...subResults);
  }

  return results;
}

/**
 * Discover all Stylus contracts in a directory.
 *
 * Recursively scans for Cargo.toml files with stylus-sdk dependency
 * and extracts metadata including rust-toolchain.toml.
 *
 * @param contractsDir - Root directory to scan for contracts
 * @param options - Optional filtering options
 * @returns Array of discovered Stylus contracts
 */
export async function discoverStylusContracts(
  contractsDir: string,
  options?: DiscoveryOptions,
): Promise<StylusContractInfo[]> {
  // Ensure directory exists
  try {
    const stats = await stat(contractsDir);
    if (!stats.isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  // Find all directories with Cargo.toml
  const cargoDirs = await findCargoDirectories(contractsDir);

  // Filter to valid Stylus projects and collect metadata
  const contracts: StylusContractInfo[] = [];

  for (const dir of cargoDirs) {
    const packageName = await getStylusPackageName(dir);
    if (!packageName) continue;

    // If filtering by contract names, check if this one matches
    if (options?.contracts && options.contracts.length > 0) {
      if (!options.contracts.includes(packageName)) continue;
    }

    const toolchain = await parseToolchain(dir);

    contracts.push({
      name: packageName,
      path: dir,
      toolchain,
    });
  }

  return contracts;
}
