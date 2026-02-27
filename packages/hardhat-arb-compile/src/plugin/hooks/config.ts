import type { ConfigHooks } from 'hardhat/types/hooks';
import { createStylusConfigHook } from '@cobuilders/hardhat-arb-utils/config';

import { resolveStylusCompileConfig } from '../../config/resolver.js';

const configHook: () => Promise<Partial<ConfigHooks>> = createStylusConfigHook(
  'compile',
  resolveStylusCompileConfig,
);

export default configHook;
