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

describe('Container Deploy', () => {
  describe('solidity deploy', () => {
    useFixtureProject('deploy-default');

    it(
      'deploys a solidity contract via docker',
      { timeout: 120_000 },
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

        // Should not throw
        await hre.tasks.getTask('arb:deploy').run({
          contract: 'SolidityCounter.sol',
          constructorArgs: [],
        });

        assert.ok(true, 'Solidity deploy completed successfully');
      },
    );
  });
});
