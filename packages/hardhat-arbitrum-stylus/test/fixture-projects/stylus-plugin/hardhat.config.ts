import type { HardhatUserConfig } from 'hardhat/types/config';

// eslint-disable-next-line import/no-relative-packages
import hardhatArbitrumStylusPlugin from '../../../src/index.js';
import HardhatViem from '@nomicfoundation/hardhat-viem';
import HardhatNodeTestRunner from '@nomicfoundation/hardhat-node-test-runner';

const config: HardhatUserConfig = {
  plugins: [hardhatArbitrumStylusPlugin, HardhatViem, HardhatNodeTestRunner],
  solidity: '0.8.24',
  paths: {
    tests: {
      nodejs: 'test',
    },
  },
  networks: {
    arbitrumLocal: {
      url: 'http://localhost:8547',
      type: 'http',
      accounts: [
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      ],
    },
  },
};

export default config;
