/**
 * Public utilities for hardhat-arb-compile.
 */

// Re-export shared utilities from @cobuilders/hardhat-arb-utils/stylus
export {
  discoverStylusContracts,
  type DiscoveryOptions,
  type StylusContractInfo,
  ensureVolumes,
  cleanCacheVolumes,
  RUSTUP_VOLUME_NAME,
  CARGO_VOLUME_NAME,
  ensureCompileImage,
  getCompileImageName,
  execWithProgress,
  execAsync,
  type ProgressCallback,
  type ExecResult,
  validateAllToolchains,
} from '@cobuilders/hardhat-arb-utils/stylus';

// Compilation (compile-specific)
export { compileHost, type CompileOptions } from '../services/compiler/host.js';
export type { CompileResult } from '../services/compiler/types.js';

// ABI export
export { exportStylusAbi } from '@cobuilders/hardhat-arb-utils/stylus';

// Artifact generation
export {
  buildStylusArtifact,
  generateStylusArtifact,
  saveStylusArtifact,
  type StylusArtifact,
} from '../services/artifacts/stylus-artifact.js';
