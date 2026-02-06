import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it, before, after } from 'node:test';
import { pathToFileURL } from 'node:url';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

import { getCompileImageName } from '../src/utils/compiler/image-builder.js';

async function hasDocker(): Promise<boolean> {
  try {
    return new DockerClient().isAvailable();
  } catch {
    return false;
  }
}

describe('Container Compile', () => {
  describe('image-builder', () => {
    it('generates correct image name', () => {
      const imageName = getCompileImageName();
      assert.equal(imageName, 'stylus-compile:latest');
    });
  });

  describe('container compilation', () => {
    useFixtureProject('compile-container-rust');

    let contractsDir: string;

    before(() => {
      contractsDir = path.join(process.cwd(), 'contracts');
    });

    after(async () => {
      if (!contractsDir) return;
      const targetDir = path.join(contractsDir, 'stylus-counter', 'target');
      await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {});
    });

    it(
      'compiles a stylus contract via docker',
      { timeout: 600_000 },
      async (t) => {
        if (!(await hasDocker())) {
          t.skip('Docker not available');
          return;
        }

        const configPath = pathToFileURL(
          path.join(process.cwd(), 'hardhat.config.js'),
        ).href;
        const hardhatConfig = await import(configPath);
        const hre = await createHardhatRuntimeEnvironment(
          hardhatConfig.default,
        );

        await hre.tasks
          .getTask(['arb:compile'])
          .run({ contracts: 'stylus-counter', stylus: true });

        const wasmPath = path.join(
          contractsDir,
          'stylus-counter',
          'target',
          'wasm32-unknown-unknown',
          'release',
          'stylus_counter.wasm',
        );

        const exists = await fs
          .access(wasmPath)
          .then(() => true)
          .catch(() => false);

        assert.ok(exists, 'WASM output should exist after compilation');
      },
    );
  });
});
