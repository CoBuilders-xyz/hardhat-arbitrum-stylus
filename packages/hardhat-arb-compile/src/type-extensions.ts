import 'hardhat/types/config';

import type {
  StylusCompileConfig,
  StylusCompileUserConfig,
} from './config/types.js';

declare module 'hardhat/types/config' {
  export interface StylusUserConfig {
    compile?: StylusCompileUserConfig;
  }

  export interface StylusConfig {
    compile: StylusCompileConfig;
  }
}
