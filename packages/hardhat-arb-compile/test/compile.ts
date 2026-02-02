import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it, before, after } from 'node:test';
import { pathToFileURL } from 'node:url';

import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

import { execAsync } from '../src/utils/exec.js';

/**
 * Check if local Rust toolchain requirements are met.
 */
async function hasLocalRustSetup(): Promise<boolean> {
  try {
    // Check rustup
    await execAsync('rustup --version');
    // Check cargo-stylus
    await execAsync('cargo stylus --version');
    // Check if 1.93.0 toolchain is installed
    await execAsync('rustc +1.93.0 --version');
    // Check wasm target
    const { stdout } = await execAsync(
      'rustup +1.93.0 target list --installed',
    );
    return stdout.includes('wasm32-unknown-unknown');
  } catch {
    return false;
  }
}

/**
 * Clean target directories before/after tests.
 */
async function cleanTargets(contractsDir: string): Promise<void> {
  const entries = await fs.readdir(contractsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const targetDir = path.join(contractsDir, entry.name, 'target');
      try {
        await fs.rm(targetDir, { recursive: true, force: true });
      } catch {
        // Ignore if doesn't exist
      }
    }
  }
}

describe('Compile Task', () => {
  describe('local compilation', () => {
    useFixtureProject('compile-local-rust');

    let contractsDir: string;
    let canRunLocalTests = false;

    before(async () => {
      canRunLocalTests = await hasLocalRustSetup();
      contractsDir = path.join(process.cwd(), 'contracts');
      if (canRunLocalTests) {
        await cleanTargets(contractsDir);
      }
    });

    after(async () => {
      if (canRunLocalTests) {
        await cleanTargets(contractsDir);
      }
    });

    it('compiles all stylus contracts', async (t) => {
      if (!canRunLocalTests) {
        t.skip('Local Rust toolchain not available');
        return;
      }

      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );
      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      // Run the compile task
      await hre.tasks
        .getTask(['arb:compile'])
        .run({ contracts: '', local: true });

      // Verify WASM files were created
      const counterWasm = path.join(
        contractsDir,
        'stylus-counter',
        'target',
        'wasm32-unknown-unknown',
        'release',
        'stylus_counter.wasm',
      );
      const storageWasm = path.join(
        contractsDir,
        'stylus-storage',
        'target',
        'wasm32-unknown-unknown',
        'release',
        'stylus_storage.wasm',
      );

      const counterExists = await fs
        .access(counterWasm)
        .then(() => true)
        .catch(() => false);
      const storageExists = await fs
        .access(storageWasm)
        .then(() => true)
        .catch(() => false);

      assert.ok(counterExists, 'stylus-counter WASM should exist');
      assert.ok(storageExists, 'stylus-storage WASM should exist');
    });

    it('compiles single contract when filtered', async (t) => {
      if (!canRunLocalTests) {
        t.skip('Local Rust toolchain not available');
        return;
      }

      await cleanTargets(contractsDir);

      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );
      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      // Run the compile task for only stylus-counter
      await hre.tasks
        .getTask(['arb:compile'])
        .run({ contracts: 'stylus-counter', local: true });

      // Verify only counter WASM was created
      const counterWasm = path.join(
        contractsDir,
        'stylus-counter',
        'target',
        'wasm32-unknown-unknown',
        'release',
        'stylus_counter.wasm',
      );
      const storageWasm = path.join(
        contractsDir,
        'stylus-storage',
        'target',
        'wasm32-unknown-unknown',
        'release',
        'stylus_storage.wasm',
      );

      const counterExists = await fs
        .access(counterWasm)
        .then(() => true)
        .catch(() => false);
      const storageExists = await fs
        .access(storageWasm)
        .then(() => true)
        .catch(() => false);

      assert.ok(counterExists, 'stylus-counter WASM should exist');
      assert.ok(!storageExists, 'stylus-storage WASM should NOT exist');
    });

    it('ignores non-stylus contracts', async (t) => {
      if (!canRunLocalTests) {
        t.skip('Local Rust toolchain not available');
        return;
      }

      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );
      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      // The non-stylus-lib should not be compiled
      // This is implicitly tested by the fact that compile succeeds
      // and only 2 contracts are found
      await hre.tasks
        .getTask(['arb:compile'])
        .run({ contracts: '', local: true });

      // Verify non-stylus-lib has no target directory
      const nonStylusTarget = path.join(
        contractsDir,
        'non-stylus-lib',
        'target',
      );
      const targetExists = await fs
        .access(nonStylusTarget)
        .then(() => true)
        .catch(() => false);

      assert.ok(
        !targetExists,
        'non-stylus-lib should not have target directory',
      );
    });
  });
});
