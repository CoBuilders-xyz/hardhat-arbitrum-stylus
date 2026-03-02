import { resolveStylusSubConfig } from '@cobuilders/hardhat-arb-utils/config';

import type { StylusTestConfig, StylusTestUserConfig } from './types.js';
import { DEFAULT_STYLUS_TEST_CONFIG } from './defaults.js';

/**
 * Resolve user-provided config with defaults.
 */
export function resolveStylusTestConfig(
  userConfig?: StylusTestUserConfig,
): StylusTestConfig {
  return resolveStylusSubConfig<StylusTestConfig, StylusTestUserConfig>(
    userConfig,
    DEFAULT_STYLUS_TEST_CONFIG,
  );
}
