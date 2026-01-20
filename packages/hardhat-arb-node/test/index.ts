import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

import { useFixtureProject } from './helpers/useFixtureProject.js';

describe('@cobuilders/hardhat-arb-node', () => {
  describe('plugin loading', () => {
    useFixtureProject('node-plugin');

    it('loads all subtasks', async () => {
      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      // Check parent task exists
      assert.notEqual(hre.tasks.getTask(['arb:node']), undefined);

      // Check all subtasks exist
      assert.notEqual(hre.tasks.getTask(['arb:node', 'start']), undefined);
      assert.notEqual(hre.tasks.getTask(['arb:node', 'stop']), undefined);
      assert.notEqual(hre.tasks.getTask(['arb:node', 'status']), undefined);
      assert.notEqual(hre.tasks.getTask(['arb:node', 'logs']), undefined);
    });

    it('resolves config with defaults', async () => {
      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      assert.equal(hre.config.arbNode.image, 'offchainlabs/nitro-node');
      assert.equal(hre.config.arbNode.tag, 'v3.7.1-926f1ab');
      assert.equal(hre.config.arbNode.httpPort, 8547);
      assert.equal(hre.config.arbNode.wsPort, 8548);
    });
  });

  describe('custom config', () => {
    useFixtureProject('node-plugin-custom-config');

    it('resolves config with custom values', async () => {
      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      // Custom values should be used
      assert.equal(hre.config.arbNode.httpPort, 9547);
      assert.equal(hre.config.arbNode.wsPort, 9548);

      // Defaults should still apply for unspecified values
      assert.equal(hre.config.arbNode.image, 'offchainlabs/nitro-node');
      assert.equal(hre.config.arbNode.tag, 'v3.7.1-926f1ab');
    });
  });
});
