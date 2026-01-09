import type { HardhatPlugin } from 'hardhat/types/plugins';

const hardhatArbCompilePlugin: HardhatPlugin = {
  id: 'hardhat-arb-compile',
  npmPackage: '@cobuilders/hardhat-arb-compile',
};

export default hardhatArbCompilePlugin;
