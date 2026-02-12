import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';

import { DockerClient } from '../src/container/docker-client.js';
import { ContainerManager } from '../src/container/container-manager.js';

// Get the directory of the current module (for creating temp dirs within the package)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Helper to clean up a container by name (ignoring errors if it doesn't exist)
 */
async function cleanupContainer(
  client: DockerClient,
  name: string,
): Promise<void> {
  try {
    const existingId = await client.findByName(name);
    if (existingId) {
      await client.remove(existingId, true);
    }
  } catch {
    // Ignore cleanup errors
  }
}

describe('Docker Container Utilities', () => {
  let client: DockerClient;
  let manager: ContainerManager;

  before(() => {
    client = new DockerClient();
    manager = new ContainerManager(client);
  });

  describe('DockerClient', () => {
    it('should check if image exists', async () => {
      // hello-world is a very small image, check if it exists
      const exists = await client.imageExists('hello-world', 'latest');
      assert.equal(typeof exists, 'boolean');
    });
  });

  describe('ContainerManager - Run with command', () => {
    it('should run hello-world container with default command', async () => {
      const containerName = 'hardhat-arb-utils-test-hello';
      await cleanupContainer(client, containerName);

      const info = await manager.start({
        image: 'hello-world',
        tag: 'latest',
        name: containerName,
        autoRemove: true,
      });

      assert.ok(info.id, 'Container should have an ID');
      assert.equal(info.image, 'hello-world');

      // Wait a moment for the container to finish (hello-world exits immediately)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clean up - container may have already exited and been removed
      try {
        await manager.remove(info.id);
      } catch {
        // Container already removed by autoRemove
      }
    });

    it('should run alpine container with custom echo command', async () => {
      const containerName = 'hardhat-arb-utils-test-alpine';
      await cleanupContainer(client, containerName);

      const testMessage = 'Hello from hardhat-arb-utils test!';

      // Run alpine with a custom command (detached mode for reliable container ID)
      const containerId = await client.run({
        image: 'alpine',
        tag: 'latest',
        name: containerName,
        command: ['echo', testMessage],
        detach: true,
        autoRemove: false,
      });

      assert.ok(containerId, 'Should return container ID');

      // Wait for container to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get logs to verify the command output
      const logs = await client.logs(containerId.trim());
      assert.ok(
        logs.includes(testMessage),
        `Logs should contain "${testMessage}"`,
      );

      // Clean up
      await client.remove(containerId.trim(), true);
    });
  });

  describe('DockerClient - Volume operations', () => {
    const testVolumeName = 'hardhat-arb-utils-test-volume';

    it('should report false for a non-existent volume', async () => {
      const exists = await client.volumeExists('non-existent-volume-abc123xyz');
      assert.strictEqual(exists, false);
    });

    it('should create, check, and remove a volume', async () => {
      // Cleanup in case of leftover from previous test run
      try {
        await client.removeVolume(testVolumeName);
      } catch {
        // Ignore if it doesn't exist
      }

      // Create
      await client.createVolume(testVolumeName);

      // Check existence
      const exists = await client.volumeExists(testVolumeName);
      assert.strictEqual(exists, true);

      // Remove
      await client.removeVolume(testVolumeName);

      // Verify removal
      const existsAfter = await client.volumeExists(testVolumeName);
      assert.strictEqual(existsAfter, false);
    });
  });

  describe('ContainerManager - Run with volume', () => {
    let tempDir: string;

    before(async () => {
      // Create a temporary directory within the package directory (Docker has access to workspace paths)
      tempDir = path.join(__dirname, '.tmp-volume-test');
      await fs.mkdir(tempDir, { recursive: true });
    });

    after(async () => {
      // Clean up temp directory
      try {
        await fs.rm(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should run container with volume and write output to host', async () => {
      const containerName = 'hardhat-arb-utils-test-volume';
      await cleanupContainer(client, containerName);

      const outputFileName = 'result.txt';
      const outputContent = 'Output from container volume test';

      // Run alpine container that writes to mounted volume (detached mode for reliable container ID)
      const containerId = await client.run({
        image: 'alpine',
        tag: 'latest',
        name: containerName,
        command: [
          'sh',
          '-c',
          `echo "${outputContent}" > /output/${outputFileName}`,
        ],
        volumes: [
          {
            host: tempDir,
            container: '/output',
            readonly: false,
          },
        ],
        detach: true,
        autoRemove: false,
      });

      assert.ok(containerId, 'Should return container ID');

      // Wait for container to finish writing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify the file was written to the host filesystem
      const outputPath = path.join(tempDir, outputFileName);
      const fileContent = await fs.readFile(outputPath, 'utf-8');
      assert.ok(
        fileContent.trim().includes(outputContent),
        `File should contain "${outputContent}"`,
      );

      // Clean up
      await client.remove(containerId.trim(), true);
    });

    it('should handle readonly volume mounts', async () => {
      const containerName = 'hardhat-arb-utils-test-readonly';
      await cleanupContainer(client, containerName);

      // Create a test file in temp directory
      const testFileName = 'input.txt';
      const testContent = 'Input data for container';
      await fs.writeFile(path.join(tempDir, testFileName), testContent);

      // Run alpine container that reads from readonly mounted volume (detached mode for reliable container ID)
      const containerId = await client.run({
        image: 'alpine',
        tag: 'latest',
        name: containerName,
        command: ['cat', `/input/${testFileName}`],
        volumes: [
          {
            host: tempDir,
            container: '/input',
            readonly: true,
          },
        ],
        detach: true,
        autoRemove: false,
      });

      assert.ok(containerId, 'Should return container ID');

      // Wait for container to finish
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get logs to verify the file was read
      const logs = await client.logs(containerId.trim());
      assert.ok(
        logs.includes(testContent),
        `Logs should contain "${testContent}"`,
      );

      // Clean up
      await client.remove(containerId.trim(), true);
    });
  });
});
