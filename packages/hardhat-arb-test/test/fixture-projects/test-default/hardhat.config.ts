import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumTestPlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbitrumTestPlugin],
};

export default config;
