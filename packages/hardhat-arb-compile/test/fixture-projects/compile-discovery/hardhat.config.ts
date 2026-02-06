import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumStylusPlugin from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [HardhatArbitrumStylusPlugin],
};

export default config;
