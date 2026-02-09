import type { HardhatUserConfig } from 'hardhat/types/config';

import HardhatArbNodePlugin from '../../../src/index.js';

const config: HardhatUserConfig = {
  plugins: [HardhatArbNodePlugin],
  stylus: {
    node: {
      httpPort: 9547,
      wsPort: 9548,
    },
  },
};

export default config;
