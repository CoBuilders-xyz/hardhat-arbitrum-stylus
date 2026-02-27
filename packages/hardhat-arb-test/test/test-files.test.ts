import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import {
  normalizeExplicitTestFiles,
  resolveTestDir,
  resolveTestFiles,
} from '../src/services/container/test-files.js';

function createHre(
  root: string,
  nodejsTestsDir?: string,
): HardhatRuntimeEnvironment {
  return {
    config: {
      paths: {
        root,
        ...(nodejsTestsDir !== undefined
          ? { tests: { nodejs: nodejsTestsDir } }
          : {}),
      },
    },
  } as unknown as HardhatRuntimeEnvironment;
}

describe('container test file resolution', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arb-test-files-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('uses the default test directory under project root', () => {
    const hre = createHre(tmpDir);
    assert.equal(resolveTestDir(hre), path.join(tmpDir, 'test'));
  });

  it('honors paths.tests.nodejs when configured', () => {
    const customDir = path.join(tmpDir, 'custom-tests');
    const hre = createHre(tmpDir, customDir);
    assert.equal(resolveTestDir(hre), customDir);
  });

  it('discovers supported test files in deterministic order', async () => {
    const testDir = path.join(tmpDir, 'test');
    await fs.mkdir(path.join(testDir, 'nested'), { recursive: true });
    await fs.writeFile(path.join(testDir, 'b.test.ts'), '', 'utf-8');
    await fs.writeFile(path.join(testDir, 'a.txt'), '', 'utf-8');
    await fs.writeFile(path.join(testDir, 'nested', 'a.test.js'), '', 'utf-8');
    await fs.writeFile(path.join(testDir, 'nested', 'z.md'), '', 'utf-8');

    const hre = createHre(tmpDir);
    const files = await resolveTestFiles(hre, []);

    assert.deepEqual(files, [
      path.join(testDir, 'b.test.ts'),
      path.join(testDir, 'nested', 'a.test.js'),
    ]);
  });

  it('throws a plugin error when the test directory is missing', async () => {
    const hre = createHre(tmpDir);

    await assert.rejects(resolveTestFiles(hre, []), /does not exist/);
  });

  it('normalizes and deduplicates explicit test files', () => {
    const files = normalizeExplicitTestFiles([
      'test//alpha.test.ts',
      'test/alpha.test.ts',
      'test/../test/beta.test.ts',
    ]);

    assert.deepEqual(files, ['test/alpha.test.ts', 'test/beta.test.ts']);
  });
});
