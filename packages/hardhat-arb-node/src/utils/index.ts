// Temp node lifecycle
export {
  generateTempContainerName,
  registerTempContainer,
  unregisterTempContainer,
  getActiveTempContainer,
  setActiveTempContainer,
  isTempContainerRunning,
  cleanupTempContainer,
  cleanupAllTempContainers,
  ensureExitHandlerRegistered,
} from '../services/runtime/temp-node.js';

// Chain setup
export {
  performEssentialSetup,
  prefundAccounts,
} from '../services/lifecycle/chain-setup.js';

// Chain infrastructure deployment
export {
  deployCreate2Factory,
  deployCacheManager,
  deployStylusDeployer,
} from '../services/lifecycle/chain-infra.js';

// Node transactions
export {
  PRECOMPILES,
  CREATE2_FACTORY,
  createNodeClient,
  becomeChainOwner,
  setL1PricePerUnit,
  deployContract,
  sendEth,
  addWasmCacheManager,
  deployViaCreate2,
} from '../services/transactions/client.js';

// Batch funder
export { batchFundAccounts } from '../services/transactions/batch-funder.js';

// Startup info
export { printStartupInfo } from '../services/lifecycle/startup-info.js';
