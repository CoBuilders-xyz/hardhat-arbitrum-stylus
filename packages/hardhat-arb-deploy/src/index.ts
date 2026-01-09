import type { HardhatPlugin } from 'hardhat/types/plugins';

const hardhatArbDeployPlugin: HardhatPlugin = {
  id: 'hardhat-arb-deploy',
  npmPackage: '@cobuilders/hardhat-arb-deploy',
};

export default hardhatArbDeployPlugin;
