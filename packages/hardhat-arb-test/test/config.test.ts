import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

describe('Stylus Test Config', () => {
  describe('default config', () => {
    useFixtureProject('test-default');

    it('resolves config with defaults', async () => {
      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      assert.equal(hre.config.stylus.test.useHostToolchain, false);
    });
  });

  describe('custom config', () => {
    useFixtureProject('test-custom-config');

    it('resolves config with custom values', async () => {
      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      assert.equal(hre.config.stylus.test.useHostToolchain, true);
    });
  });
});
