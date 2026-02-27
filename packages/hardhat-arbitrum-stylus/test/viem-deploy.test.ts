import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

async function hasDocker(): Promise<boolean> {
  try {
    return new DockerClient().isAvailable();
  } catch {
    return false;
  }
}

describe('Viem Deploy Integration', () => {
  useFixtureProject('stylus-plugin');

  it('registers the deploy network hook alongside hardhat-viem', async () => {
    const hardhatConfig = await import(
      pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
    );

    const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

    // The deploy plugin should be loaded with its network hook
    assert.notEqual(hre.tasks.getTask(['arb:deploy']), undefined);

    // The HRE should boot successfully with all plugins
    assert.notEqual(hre.tasks.getTask(['arb:node']), undefined);
    assert.notEqual(hre.tasks.getTask(['arb:compile']), undefined);
    assert.notEqual(hre.tasks.getTask(['arb:test']), undefined);
  });

  it(
    'deploys a Solidity contract via viem.deployContract',
    { timeout: 120_000 },
    async (t) => {
      if (!(await hasDocker())) {
        t.skip('Docker not available');
        return;
      }

      const hardhatConfig = await import(
        pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
      );

      const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

      // Compile Solidity contracts first
      await hre.tasks.getTask('compile').run({ quiet: true });

      // Connect to the default network (auto-starts nitro-devnode)
      const connection = await hre.network.connect();

      try {
        // Access the viem helpers (attached by hardhat-viem, wrapped by arb-deploy)
        const viem = (
          connection as unknown as {
            viem: {
              deployContract: (
                name: string,
                args?: readonly unknown[],
              ) => Promise<{
                address: string;
                read: {
                  count: () => Promise<bigint>;
                };
                write: {
                  increment: () => Promise<string>;
                  setCount: (args: readonly [bigint]) => Promise<string>;
                };
              }>;
            };
          }
        ).viem;

        assert.ok(viem, 'viem helpers should be attached to connection');
        assert.ok(
          typeof viem.deployContract === 'function',
          'deployContract should be a function',
        );

        // Deploy SolidityCounter via viem — goes through our hook (pass-through for Solidity)
        const counter = await viem.deployContract('SolidityCounter');

        assert.ok(counter.address, 'Deployed contract should have an address');

        // Interact with the deployed contract
        const initialCount = await counter.read.count();
        assert.equal(initialCount, 0n, 'Initial count should be 0');

        await counter.write.increment();
        const afterIncrement = await counter.read.count();
        assert.equal(afterIncrement, 1n, 'Count should be 1 after increment');

        await counter.write.setCount([42n]);
        const afterSet = await counter.read.count();
        assert.equal(afterSet, 42n, 'Count should be 42 after setCount');
      } finally {
        await connection.close();
      }
    },
  );
});
