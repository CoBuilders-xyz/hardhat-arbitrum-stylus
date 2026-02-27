import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

const TEST_FILE_EXT_RE = /\.(ts|js|cts|mts|cjs|mjs)$/i;

export function resolveTestDir(hre: HardhatRuntimeEnvironment): string {
  const paths = hre.config.paths as unknown as Record<string, unknown>;
  const tests = paths.tests as Record<string, string> | undefined;
  return tests?.nodejs ?? path.join(hre.config.paths.root, 'test');
}

export function normalizeExplicitTestFiles(testFiles: string[]): string[] {
  const seen = new Set<string>();
  const normalizedFiles: string[] = [];

  for (const testFile of testFiles) {
    const normalized = path.normalize(testFile);
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    normalizedFiles.push(normalized);
  }

  return normalizedFiles;
}

export async function resolveTestFiles(
  hre: HardhatRuntimeEnvironment,
  testFiles: string[],
): Promise<string[]> {
  if (testFiles.length > 0) {
    return normalizeExplicitTestFiles(testFiles);
  }

  const testDir = resolveTestDir(hre);

  try {
    await stat(testDir);
  } catch {
    throw createPluginError(
      `Test directory "${testDir}" does not exist. ` +
        'Create a test/ directory or pass test files explicitly.',
    );
  }

  const entries = await readdir(testDir, { recursive: true });

  return entries
    .filter((entry) => TEST_FILE_EXT_RE.test(entry))
    .map((entry) => path.join(testDir, entry))
    .sort((a, b) => a.localeCompare(b));
}
