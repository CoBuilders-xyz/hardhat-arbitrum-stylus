import type { StylusCompileConfig, StylusCompileUserConfig } from './types.js';

import { DEFAULT_STYLUS_COMPILE_CONFIG } from './defaults.js';

/**
 * Resolve user-provided config with defaults.
 */
export function resolveStylusCompileConfig(
  userConfig?: StylusCompileUserConfig,
): StylusCompileConfig {
  return {
    useHostToolchain:
      userConfig?.useHostToolchain ??
      DEFAULT_STYLUS_COMPILE_CONFIG.useHostToolchain,
  };
}
