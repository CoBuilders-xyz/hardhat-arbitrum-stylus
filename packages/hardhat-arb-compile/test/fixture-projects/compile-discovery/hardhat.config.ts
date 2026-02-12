import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumCompilePlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbitrumCompilePlugin],
};

export default config;
