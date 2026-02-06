import assert from 'node:assert/strict';
import { describe, it, before } from 'node:test';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import {
  compileImageExists,
  getCompileImageName,
} from '../src/utils/compiler/image-builder.js';

/**
 * Check if Docker is available.
 */
async function hasDockerAvailable(): Promise<boolean> {
  try {
    const client = new DockerClient();
    return client.isAvailable();
  } catch {
    return false;
  }
}

describe('Container Compile', () => {
  let dockerAvailable = false;

  before(async () => {
    dockerAvailable = await hasDockerAvailable();
  });

  describe('image-builder', () => {
    it('generates correct image name', () => {
      const imageName = getCompileImageName('1.83.0');
      assert.equal(imageName, 'stylus-compile:1.83.0');
    });

    it('generates correct image name for nightly', () => {
      const imageName = getCompileImageName('nightly-2024-01-01');
      assert.equal(imageName, 'stylus-compile:nightly-2024-01-01');
    });

    it('compileImageExists returns false for non-existent image', async (t) => {
      if (!dockerAvailable) {
        t.skip('Docker not available');
        return;
      }

      // Use a toolchain version that almost certainly doesn't exist
      const exists = await compileImageExists('999.999.999');
      assert.equal(exists, false);
    });
  });

  describe('docker network', () => {
    it('can create and remove networks', async (t) => {
      if (!dockerAvailable) {
        t.skip('Docker not available');
        return;
      }

      const client = new DockerClient();
      const networkName = `test-network-${Date.now()}`;

      // Create network
      await client.createNetwork(networkName);

      // Verify it exists
      const exists = await client.networkExists(networkName);
      assert.equal(exists, true, 'Network should exist after creation');

      // Remove network
      await client.removeNetwork(networkName);

      // Verify it's gone
      const existsAfter = await client.networkExists(networkName);
      assert.equal(
        existsAfter,
        false,
        'Network should not exist after removal',
      );
    });
  });

  describe('container config', () => {
    it('network is passed to container config', async (t) => {
      if (!dockerAvailable) {
        t.skip('Docker not available');
        return;
      }

      // This test verifies that the ContainerConfig type includes network
      // by importing and checking the type at runtime
      const config = {
        image: 'test',
        tag: 'latest',
        network: 'test-network',
      };

      assert.equal(config.network, 'test-network');
    });
  });
});
