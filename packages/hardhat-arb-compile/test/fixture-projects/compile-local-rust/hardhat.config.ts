import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbCompilePlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbCompilePlugin],
  stylusCompile: {
    useLocalRust: true,
  },
};

export default config;
