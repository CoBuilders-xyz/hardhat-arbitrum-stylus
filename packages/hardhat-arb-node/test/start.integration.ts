import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it, after } from 'node:test';
import { pathToFileURL } from 'node:url';

import { DockerClient, useFixtureProject } from '@cobuilders/hardhat-arb-utils';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';
import { CONTAINER_NAME } from '../src/config/defaults.js';
import {
  getCode,
  PRECOMPILES,
  CREATE2_FACTORY,
} from '../src/utils/transactions.js';

/**
 * Clean up the container after tests
 */
async function cleanupContainer(): Promise<void> {
  const client = new DockerClient();
  const containerId = await client.findByName(CONTAINER_NAME);
  if (containerId) {
    try {
      await client.stop(containerId);
      await client.remove(containerId, true);
    } catch {
      // Ignore cleanup errors
    }
  }
}

describe(
  '@cobuilders/hardhat-arb-node integration',
  { timeout: 120000 },
  () => {
    useFixtureProject('node-plugin');

    after(async () => {
      await cleanupContainer();
    });

    describe('arb:node start', () => {
      after(async () => {
        await cleanupContainer();
      });

      it('starts the node with essential setup (detached mode)', async () => {
        const hardhatConfig = await import(
          pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
        );

        const hre = await createHardhatRuntimeEnvironment(
          hardhatConfig.default,
        );
        const config = hre.config.arbNode;
        const rpcUrl = `http://localhost:${config.httpPort}`;

        // Run start task with detach flag
        await hre.tasks.getTask(['arb:node', 'start']).run({
          quiet: false,
          detach: true,
          stylusReady: false,
          persist: false,
        });

        // Verify node is running by making an RPC call
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1,
          }),
        });

        const result = (await response.json()) as { result: string };
        assert.equal(
          result.result,
          '0x' + config.chainId.toString(16),
          'Chain ID should match',
        );

        // Verify ArbDebug precompile is accessible (chain owner setup done)
        const arbDebugCode = await getCode(rpcUrl, PRECOMPILES.ARB_DEBUG);
        assert.ok(arbDebugCode !== '0x', 'ArbDebug precompile should exist');
      });

      it('starts the node with --stylus-ready flag', async () => {
        // Clean up any existing container first
        await cleanupContainer();

        const hardhatConfig = await import(
          pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
        );

        const hre = await createHardhatRuntimeEnvironment(
          hardhatConfig.default,
        );
        const config = hre.config.arbNode;
        const rpcUrl = `http://localhost:${config.httpPort}`;

        // Run start task with stylus-ready flag
        await hre.tasks.getTask(['arb:node', 'start']).run({
          quiet: false,
          detach: true,
          stylusReady: true,
          persist: false,
        });

        // Verify CREATE2 factory is deployed
        const create2Code = await getCode(rpcUrl, CREATE2_FACTORY.ADDRESS);
        assert.ok(
          create2Code !== '0x',
          'CREATE2 factory should be deployed with --stylus-ready',
        );
      });
    });

    describe('arb:node stop', () => {
      it('stops the running node', async () => {
        const hardhatConfig = await import(
          pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
        );

        const hre = await createHardhatRuntimeEnvironment(
          hardhatConfig.default,
        );

        // First ensure node is running
        const client = new DockerClient();
        let containerId = await client.findByName(CONTAINER_NAME);

        if (!containerId) {
          // Start the node first
          await hre.tasks.getTask(['arb:node', 'start']).run({
            quiet: true,
            detach: true,
            stylusReady: false,
            persist: false,
          });
        }

        // Run stop task
        await hre.tasks.getTask(['arb:node', 'stop']).run({
          quiet: false,
        });

        // Verify node is stopped
        containerId = await client.findByName(CONTAINER_NAME);
        assert.equal(
          containerId,
          null,
          'Container should not exist after stop',
        );
      });
    });

    describe('arb:node status', () => {
      it('reports node status correctly', async () => {
        const hardhatConfig = await import(
          pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
        );

        const hre = await createHardhatRuntimeEnvironment(
          hardhatConfig.default,
        );

        // Clean up first
        await cleanupContainer();

        // Status should report not running
        // (We can't easily capture console output, but at least verify it doesn't throw)
        await hre.tasks.getTask(['arb:node', 'status']).run({});

        // Start the node
        await hre.tasks.getTask(['arb:node', 'start']).run({
          quiet: true,
          detach: true,
          stylusReady: false,
          persist: false,
        });

        // Status should report running
        await hre.tasks.getTask(['arb:node', 'status']).run({});
      });
    });

    describe('arb:node start --persist', () => {
      after(async () => {
        await cleanupContainer();
      });

      it('persistent container survives stop and can be restarted', async () => {
        // Clean up any existing container first
        await cleanupContainer();

        const hardhatConfig = await import(
          pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
        );

        const hre = await createHardhatRuntimeEnvironment(
          hardhatConfig.default,
        );
        const config = hre.config.arbNode;
        const rpcUrl = `http://localhost:${config.httpPort}`;
        const client = new DockerClient();

        // Start the node with persist flag
        await hre.tasks.getTask(['arb:node', 'start']).run({
          quiet: false,
          detach: true,
          stylusReady: false,
          persist: true,
        });

        // Verify node is running
        let containerId = await client.findByName(CONTAINER_NAME);
        assert.ok(containerId, 'Container should exist');
        let isRunning = await client.isRunning(containerId);
        assert.ok(isRunning, 'Container should be running');

        // Stop the container (simulating Ctrl+C behavior)
        await client.stop(containerId);

        // Verify container still exists but is stopped
        containerId = await client.findByName(CONTAINER_NAME);
        assert.ok(containerId, 'Container should still exist after stop');
        isRunning = await client.isRunning(containerId);
        assert.ok(!isRunning, 'Container should not be running after stop');

        // Restart with persist flag - should reuse existing container
        await hre.tasks.getTask(['arb:node', 'start']).run({
          quiet: false,
          detach: true,
          stylusReady: false,
          persist: true,
        });

        // Verify node is running again
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1,
          }),
        });

        const result = (await response.json()) as { result: string };
        assert.equal(
          result.result,
          '0x' + config.chainId.toString(16),
          'Chain ID should match after restart',
        );
      });
    });
  },
);
