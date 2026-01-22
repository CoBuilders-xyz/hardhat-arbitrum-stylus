import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbNodePlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbNodePlugin],
};

export default config;
