import type { HardhatPlugin } from 'hardhat/types/plugins';

import { task } from 'hardhat/config';

import './type-extensions.js';

const hardhatArbDeployPlugin: HardhatPlugin = {
  id: 'hardhat-arb-deploy',
  npmPackage: '@cobuilders/hardhat-arb-deploy',
  dependencies: () => [import('@cobuilders/hardhat-arb-node')],
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
  },
  tasks: [
    task('arb:deploy', 'Deploy a Solidity or Stylus contract')
      .addPositionalArgument({
        name: 'contract',
        description:
          'Contract to deploy: .sol file (e.g. MyContract.sol) or Stylus folder name (e.g. stylus-counter)',
      })
      .addVariadicArgument({
        name: 'constructorArgs',
        description: 'Constructor arguments in order (like Foundry)',
        defaultValue: [],
      })
      .addFlag({
        name: 'host',
        description: 'Use host Rust toolchain instead of Docker',
      })
      .setAction(() => import('./tasks/deploy.js'))
      .build(),
  ],
};

export default hardhatArbDeployPlugin;
