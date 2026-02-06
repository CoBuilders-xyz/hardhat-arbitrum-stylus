/**
 * Public utilities for hardhat-arb-compile.
 */

// Discovery
export {
  discoverStylusContracts,
  type DiscoveryOptions,
  type StylusContractInfo,
} from './discovery/index.js';

// Compilation
export { compileLocal, type CompileOptions } from './compiler/local.js';
export type { CompileResult } from './compiler/types.js';

// ABI export
export { exportStylusAbi } from './abi/export.js';

// Artifact generation
export {
  buildStylusArtifact,
  generateStylusArtifact,
  saveStylusArtifact,
  type StylusArtifact,
} from './stylus-artifacts/stylus-artifact.js';
