import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbitrumCompilePlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbitrumCompilePlugin],
  solidity: '0.8.24',
  stylus: {
    compile: {
      useHostToolchain: false,
    },
  },
};

export default config;
