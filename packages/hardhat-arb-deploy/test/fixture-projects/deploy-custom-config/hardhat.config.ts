import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumDeployPlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbitrumDeployPlugin],
  stylus: {
    deploy: {
      useHostToolchain: true,
    },
  },
};

export default config;
