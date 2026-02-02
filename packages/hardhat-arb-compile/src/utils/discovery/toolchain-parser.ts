import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parse } from 'smol-toml';

import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

/**
 * Parse a rust-toolchain.toml file and extract the toolchain channel.
 *
 * @param dirPath - Directory containing the rust-toolchain.toml file
 * @returns The toolchain channel (e.g., "1.93.0")
 * @throws HardhatPluginError if file is missing or invalid
 */
export async function parseToolchain(dirPath: string): Promise<string> {
  const toolchainPath = path.join(dirPath, 'rust-toolchain.toml');

  let content: string;
  try {
    content = await readFile(toolchainPath, 'utf-8');
  } catch {
    throw createPluginError(
      `Missing rust-toolchain.toml in ${dirPath}. ` +
        `Each Stylus contract must have a rust-toolchain.toml file specifying the Rust version.`,
    );
  }

  let toolchainToml: Record<string, unknown>;
  try {
    toolchainToml = parse(content) as Record<string, unknown>;
  } catch (error) {
    throw createPluginError(
      `Failed to parse rust-toolchain.toml in ${dirPath}`,
      error instanceof Error ? error : undefined,
    );
  }

  const toolchain = toolchainToml.toolchain as Record<string, unknown>;
  if (!toolchain || typeof toolchain.channel !== 'string') {
    throw createPluginError(
      `Invalid rust-toolchain.toml in ${dirPath}: missing [toolchain].channel`,
    );
  }

  return toolchain.channel;
}
