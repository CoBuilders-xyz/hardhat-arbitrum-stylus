import { resolveStylusSubConfig } from '@cobuilders/hardhat-arb-utils/config';

import type { StylusDeployConfig, StylusDeployUserConfig } from './types.js';
import { DEFAULT_STYLUS_DEPLOY_CONFIG } from './defaults.js';

/**
 * Resolve user-provided config with defaults.
 */
export function resolveStylusDeployConfig(
  userConfig?: StylusDeployUserConfig,
): StylusDeployConfig {
  return resolveStylusSubConfig<StylusDeployConfig, StylusDeployUserConfig>(
    userConfig,
    DEFAULT_STYLUS_DEPLOY_CONFIG,
  );
}
