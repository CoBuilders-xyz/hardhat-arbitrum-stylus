import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parse } from 'smol-toml';

import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

/**
 * Result of parsing a Cargo.toml file.
 */
export interface CargoParseResult {
  /** Package name */
  name: string;
  /** Whether this is a Stylus project (has stylus-sdk dependency) */
  isStylus: boolean;
}

/**
 * Parse a Cargo.toml file and determine if it's a Stylus project.
 *
 * @param cargoPath - Path to the Cargo.toml file
 * @returns Parse result with package name and Stylus detection, or null if invalid
 */
export async function parseCargoToml(
  cargoPath: string,
): Promise<CargoParseResult | null> {
  let content: string;
  try {
    content = await readFile(cargoPath, 'utf-8');
  } catch {
    return null;
  }

  let cargo: Record<string, unknown>;
  try {
    cargo = parse(content) as Record<string, unknown>;
  } catch (error) {
    throw createPluginError(
      `Failed to parse Cargo.toml at ${cargoPath}`,
      error instanceof Error ? error : undefined,
    );
  }

  const pkg = cargo.package as Record<string, unknown> | undefined;
  if (!pkg || typeof pkg.name !== 'string') {
    return null;
  }

  const deps = cargo.dependencies as Record<string, unknown> | undefined;
  const devDeps = cargo['dev-dependencies'] as
    | Record<string, unknown>
    | undefined;

  const hasStylusSdk =
    (deps && 'stylus-sdk' in deps) || (devDeps && 'stylus-sdk' in devDeps);

  return {
    name: pkg.name,
    isStylus: Boolean(hasStylusSdk),
  };
}

/**
 * Check if a directory contains a valid Stylus project.
 *
 * @param dirPath - Directory path to check
 * @returns Package name if valid Stylus project, null otherwise
 */
export async function getStylusPackageName(
  dirPath: string,
): Promise<string | null> {
  const cargoPath = path.join(dirPath, 'Cargo.toml');
  const result = await parseCargoToml(cargoPath);

  if (!result || !result.isStylus) {
    return null;
  }

  return result.name;
}
