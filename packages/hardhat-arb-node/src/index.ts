import type { HardhatPlugin } from 'hardhat/types/plugins';
import { task } from 'hardhat/config';

const hardhatArbNodePlugin: HardhatPlugin = {
  id: 'hardhat-arb-node',
  npmPackage: '@cobuilders/hardhat-arb-node',
  tasks: [
    task('arb:node', 'Start the Arbitrum node')
      .setAction(() => import('./tasks/node.js'))
      .build(),
  ],
};

export default hardhatArbNodePlugin;
