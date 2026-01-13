import type { HardhatPlugin } from 'hardhat/types/plugins';

const hardhatArbitrumStylusPlugin: HardhatPlugin = {
  id: 'hardhat-arbitrum-stylus',
  dependencies: () => [
    import('@cobuilders/hardhat-arb-node'),
    import('@cobuilders/hardhat-arb-compile'),
    import('@cobuilders/hardhat-arb-deploy'),
    import('@cobuilders/hardhat-arb-test'),
  ],
  npmPackage: '@cobuilders/hardhat-arbitrum-stylus',
};

export default hardhatArbitrumStylusPlugin;
