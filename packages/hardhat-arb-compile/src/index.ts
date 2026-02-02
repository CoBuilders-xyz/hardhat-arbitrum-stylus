import type { HardhatPlugin } from 'hardhat/types/plugins';

import { task } from 'hardhat/config';

import './type-extensions.js';

const hardhatArbCompilePlugin: HardhatPlugin = {
  id: 'hardhat-arb-compile',
  npmPackage: '@cobuilders/hardhat-arb-compile',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
  },
  tasks: [
    task('arb:compile', 'Compile Solidity and Stylus contracts')
      .setAction(() => import('./tasks/compile.js'))
      .build(),
  ],
};

export default hardhatArbCompilePlugin;
