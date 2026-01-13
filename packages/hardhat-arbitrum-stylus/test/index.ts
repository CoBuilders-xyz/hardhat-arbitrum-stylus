import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { useFixtureProject } from './helpers/useFixtureProject.js';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

describe('@cobuilders/hardhat-arbitrum-stylus', () => {
  useFixtureProject('stylus-plugin');

  it('boots an HRE', async () => {
    const hardhatConfig = await import(
      pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
    );

    const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);

    assert.notEqual(hre.tasks.getTask(['arb:node']), undefined);
    assert.notEqual(hre.tasks.getTask(['arb:compile']), undefined);
    assert.notEqual(hre.tasks.getTask(['arb:deploy']), undefined);
    assert.notEqual(hre.tasks.getTask(['arb:test']), undefined);
  });
});
