/**
 * Shared Stylus utilities used by compile and deploy plugins.
 */

// ABI parsing
export { parseAbiFromSolidity } from './abi/parser.js';
export { exportStylusAbi } from './abi/export-abi.js';

// Exec utilities (re-exported from shared exec module)
export {
  execAsync,
  execWithProgress,
  type ExecOptions,
  type ExecResult,
  type ProgressCallback,
} from '../exec/index.js';

// Discovery
export {
  discoverStylusContracts,
  clearDiscoveryCache,
  type DiscoveryOptions,
  type StylusContractInfo,
} from './discovery/index.js';

// Toolchain validation
export { validateAllToolchains } from './toolchain/validator.js';

// Docker volumes
export {
  RUSTUP_VOLUME_NAME,
  CARGO_VOLUME_NAME,
  ensureVolumes,
  cleanCacheVolumes,
} from './docker/volumes.js';

// Docker image
export {
  getCompileImageName,
  compileImageExists,
  ensureCompileImage,
} from './docker/image.js';

// Docker container execution
export {
  runInStylusContainer,
  type RunInStylusContainerOptions,
} from './docker/run-container.js';
export {
  runStylusContainerCommand,
  ensureContainerToolchain,
  type StylusContainerCommandOptions,
  type EnsureContainerToolchainOptions,
} from './docker/commands.js';
