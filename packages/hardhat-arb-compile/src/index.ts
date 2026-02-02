import type { HardhatPlugin } from 'hardhat/types/plugins';

import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

import './type-extensions.js';

const hardhatArbCompilePlugin: HardhatPlugin = {
  id: 'hardhat-arb-compile',
  npmPackage: '@cobuilders/hardhat-arb-compile',
  hookHandlers: {
    config: () => import('./hook-handlers/config.js'),
  },
  tasks: [
    task('arb:compile', 'Compile Stylus contracts')
      .addOption({
        name: 'contracts',
        type: ArgumentType.STRING,
        defaultValue: '',
        description: 'Comma-separated list of contract names to compile',
      })
      .addFlag({
        name: 'local',
        description: 'Use local Rust toolchain instead of Docker',
      })
      .setAction(() => import('./tasks/compile.js'))
      .build(),
  ],
};

export default hardhatArbCompilePlugin;
