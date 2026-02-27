import type { ConfigHooks } from 'hardhat/types/hooks';
import { createStylusConfigHook } from '@cobuilders/hardhat-arb-utils/config';

import { resolveStylusDeployConfig } from '../../config/resolver.js';

const configHook: () => Promise<Partial<ConfigHooks>> = createStylusConfigHook(
  'deploy',
  resolveStylusDeployConfig,
);

export default configHook;
