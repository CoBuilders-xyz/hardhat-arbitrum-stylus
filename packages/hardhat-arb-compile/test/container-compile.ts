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
      // The base image uses 'latest' tag since toolchains are installed at runtime
      const imageName = getCompileImageName();
      assert.equal(imageName, 'stylus-compile:latest');
    });

    it('compileImageExists checks for base image', async (t) => {
      if (!dockerAvailable) {
        t.skip('Docker not available');
        return;
      }

      // Check if the base compile image exists
      // This will return false if not built yet, true if previously built
      const exists = await compileImageExists();
      assert.equal(typeof exists, 'boolean');
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
});
