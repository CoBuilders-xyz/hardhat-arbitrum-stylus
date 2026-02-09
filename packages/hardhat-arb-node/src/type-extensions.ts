import 'hardhat/types/config';

import type { ArbNodeConfig, ArbNodeUserConfig } from './config/types.js';

declare module 'hardhat/types/config' {
  export interface StylusUserConfig {
    node?: ArbNodeUserConfig;
  }

  export interface StylusConfig {
    node: ArbNodeConfig;
  }

  export interface HardhatUserConfig {
    stylus?: StylusUserConfig;
  }

  export interface HardhatConfig {
    stylus: StylusConfig;
  }
}
