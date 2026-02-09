import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumStylusPlugin from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [HardhatArbitrumStylusPlugin],
  solidity: '0.8.24',
  stylus: {
    compile: {
      useLocalRust: false,
    },
  },
};

export default config;
