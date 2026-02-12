import type { StylusDeployConfig, StylusDeployUserConfig } from './types.js';

import { DEFAULT_STYLUS_DEPLOY_CONFIG } from './defaults.js';

/**
 * Resolve user-provided config with defaults.
 */
export function resolveStylusDeployConfig(
  userConfig?: StylusDeployUserConfig,
): StylusDeployConfig {
  return {
    useHostToolchain:
      userConfig?.useHostToolchain ??
      DEFAULT_STYLUS_DEPLOY_CONFIG.useHostToolchain,
  };
}
