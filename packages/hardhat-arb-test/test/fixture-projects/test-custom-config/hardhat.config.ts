import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumTestPlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbitrumTestPlugin],
  stylus: {
    test: {
      useHostToolchain: true,
    },
  },
};

export default config;
