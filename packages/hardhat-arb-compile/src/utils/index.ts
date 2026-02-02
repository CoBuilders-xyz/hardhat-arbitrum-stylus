/**
 * Utility functions for hardhat-arb-compile.
 */

// Discovery utilities
export {
  discoverStylusContracts,
  type DiscoveryOptions,
  type StylusContractInfo,
} from './discovery/index.js';

// Command execution
export { execAsync, type ExecOptions, type ExecResult } from './exec.js';

// Toolchain validation
export {
  isToolchainInstalled,
  isWasmTargetInstalled,
  isCargoStylusInstalled,
  validateLocalToolchain,
} from './toolchain/validator.js';

// Local compilation
export { compileLocal, type CompileResult } from './compiler/local.js';
