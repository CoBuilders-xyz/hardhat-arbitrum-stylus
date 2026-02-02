import 'hardhat/types/config';

import type {
  StylusCompileConfig,
  StylusCompileUserConfig,
} from './config/types.js';

declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    stylusCompile?: StylusCompileUserConfig;
  }

  export interface HardhatConfig {
    stylusCompile: StylusCompileConfig;
  }
}
