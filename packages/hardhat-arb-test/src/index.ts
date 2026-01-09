import type { HardhatPlugin } from 'hardhat/types/plugins';

const hardhatArbTestPlugin: HardhatPlugin = {
  id: 'hardhat-arb-test',
  npmPackage: '@cobuilders/hardhat-arb-test',
};

export default hardhatArbTestPlugin;
