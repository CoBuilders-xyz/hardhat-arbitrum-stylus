import type { HardhatUserConfig } from 'hardhat/types/config';

// allow relative import from package source
import hardhatArbitrumStylusPlugin from '@cobuilders/hardhat-arbitrum-stylus';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylusPlugin],
};

export default config;
