import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumDeployPlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  plugins: [HardhatArbitrumDeployPlugin],
  networks: {
    arbitrumLocal: {
      url: 'http://localhost:8545',
      type: 'http',
    },
  },
};

export default config;
