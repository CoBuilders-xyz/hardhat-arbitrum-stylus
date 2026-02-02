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
export {
  execAsync,
  execWithProgress,
  type ExecOptions,
  type ExecResult,
  type ProgressCallback,
} from './exec.js';

// Toolchain validation
export {
  isToolchainInstalled,
  isWasmTargetInstalled,
  isCargoStylusInstalled,
  validateLocalToolchain,
} from './toolchain/validator.js';

// Local compilation
export {
  compileLocal,
  type CompileResult,
  type CompileOptions,
} from './compiler/local.js';
