import type { HardhatUserConfig } from 'hardhat/types/config';

// eslint-disable-next-line import/no-relative-packages
import hardhatArbitrumStylusPlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylusPlugin],
};

export default config;
