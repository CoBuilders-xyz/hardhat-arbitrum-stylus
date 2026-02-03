import type { HardhatPlugin } from 'hardhat/types/plugins';

import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

import './type-extensions.js';

const hardhatArbCompilePlugin: HardhatPlugin = {
  id: 'hardhat-arb-compile',
  npmPackage: '@cobuilders/hardhat-arb-compile',
  dependencies: () => [import('@cobuilders/hardhat-arb-node')],
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
  },
  tasks: [
    task('arb:compile', 'Compile Solidity and Stylus contracts')
      .addOption({
        name: 'contracts',
        type: ArgumentType.STRING,
        defaultValue: '',
        description: 'Comma-separated list of Stylus contract names to compile',
      })
      .addFlag({
        name: 'local',
        description: 'Use local Rust toolchain instead of Docker',
      })
      .addFlag({
        name: 'sol',
        description: 'Compile only Solidity contracts',
      })
      .addFlag({
        name: 'stylus',
        description: 'Compile only Stylus contracts',
      })
      .setAction(() => import('./tasks/compile.js'))
      .build(),
  ],
};

export default hardhatArbCompilePlugin;
