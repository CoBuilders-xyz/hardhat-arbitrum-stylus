import type { HardhatPlugin } from 'hardhat/types/plugins';
import { task } from 'hardhat/config';

const hardhatArbTestPlugin: HardhatPlugin = {
  id: 'hardhat-arb-test',
  npmPackage: '@cobuilders/hardhat-arb-test',
  tasks: [
    task('arb:test', 'Run tests against Arbitrum node')
      .setAction(() => import('./tasks/test.js'))
      .build(),
  ],
};

export default hardhatArbTestPlugin;
