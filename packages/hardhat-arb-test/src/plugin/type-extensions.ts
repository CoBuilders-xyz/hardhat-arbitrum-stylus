import 'hardhat/types/config';

import type {
  StylusTestConfig,
  StylusTestUserConfig,
} from '../config/types.js';

declare module 'hardhat/types/config' {
  export interface StylusUserConfig {
    test?: StylusTestUserConfig;
  }

  export interface StylusConfig {
    test: StylusTestConfig;
  }

  export interface HardhatUserConfig {
    stylus?: StylusUserConfig;
  }

  export interface HardhatConfig {
    stylus: StylusConfig;
  }
}
