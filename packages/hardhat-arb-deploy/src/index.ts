import type { HardhatPlugin } from 'hardhat/types/plugins';
import { task } from 'hardhat/config';

const hardhatArbDeployPlugin: HardhatPlugin = {
  id: 'hardhat-arb-deploy',
  npmPackage: '@cobuilders/hardhat-arb-deploy',
  tasks: [
    task('arb:deploy', 'Deploy Solidity and Stylus contracts')
      .setAction(() => import('./tasks/deploy.js'))
      .build(),
  ],
};

export default hardhatArbDeployPlugin;
