import type { HardhatUserConfig } from 'hardhat/types/config';

// eslint-disable-next-line import/no-relative-packages
import hardhatArbitrumStylusPlugin from '../../../src/index.js';
import HardhatViem from '@nomicfoundation/hardhat-viem';
import HardhatNodeTestRunner from '@nomicfoundation/hardhat-node-test-runner';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylusPlugin, HardhatViem, HardhatNodeTestRunner],
  paths: {
    tests: {
      nodejs: 'test',
    },
  },
};

export default config;
