import type { ConfigHooks } from 'hardhat/types/hooks';
import { createStylusConfigHook } from '@cobuilders/hardhat-arb-utils/config';

import { resolveStylusTestConfig } from '../../config/resolver.js';

const configHook: () => Promise<Partial<ConfigHooks>> = createStylusConfigHook(
  'test',
  resolveStylusTestConfig,
);

export default configHook;
