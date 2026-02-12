import 'hardhat/types/config';

import type {
  StylusDeployConfig,
  StylusDeployUserConfig,
} from './config/types.js';

declare module 'hardhat/types/config' {
  export interface StylusUserConfig {
    deploy?: StylusDeployUserConfig;
  }

  export interface StylusConfig {
    deploy: StylusDeployConfig;
  }
}
