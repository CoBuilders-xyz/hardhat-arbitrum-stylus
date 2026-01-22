import 'hardhat/types/config';

import type { ArbNodeConfig, ArbNodeUserConfig } from './config/types.js';

declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    arbNode?: ArbNodeUserConfig;
  }

  export interface HardhatConfig {
    arbNode: ArbNodeConfig;
  }
}
