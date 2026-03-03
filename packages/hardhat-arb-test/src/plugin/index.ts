import type { HardhatPlugin } from 'hardhat/types/plugins';
import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

import './type-extensions.js';

const hardhatArbTestPlugin: HardhatPlugin = {
  id: 'hardhat-arb-test',
  npmPackage: '@cobuilders/hardhat-arb-test',
  dependencies: () => [import('@cobuilders/hardhat-arb-deploy')],
  hookHandlers: {
    config: () => import('./hooks/config.js'),
  },
  tasks: [
    task('arb:test', 'Run tests against Arbitrum node')
      .addVariadicArgument({
        name: 'testFiles',
        description: 'An optional list of test files to run',
        defaultValue: [],
      })
      .addFlag({
        name: 'only',
        description: 'Run all tests marked with .only',
      })
      .addOption({
        name: 'grep',
        description: 'Only run tests matching the given string or regexp',
        type: ArgumentType.STRING_WITHOUT_DEFAULT,
        defaultValue: undefined,
      })
      .addFlag({
        name: 'noCompile',
        description: "Don't compile Solidity before running tests",
      })
      .addFlag({
        name: 'host',
        description: 'Use host Rust toolchain instead of Docker for Stylus',
      })
      .setAction(() => import('./tasks/test.js'))
      .build(),
  ],
};

export default hardhatArbTestPlugin;
