import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

describe('Stylus Compile Config', () => {
  describe('default config', () => {
    useFixtureProject('compile-discovery');

    it('resolves config with defaults', async () => {
      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      assert.equal(hre.config.stylusCompile.useLocalRust, false);
    });
  });

  describe('custom config', () => {
    useFixtureProject('compile-local-rust');

    it('resolves config with custom values', async () => {
      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      assert.equal(hre.config.stylusCompile.useLocalRust, true);
    });
  });
});
