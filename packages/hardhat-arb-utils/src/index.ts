/**
 * @cobuilders/hardhat-arb-utils
 *
 * Shared utilities for hardhat-arbitrum-stylus plugins.
 */

// Container management
export {
  type PortMapping,
  type VolumeMapping,
  type ReadinessCheck,
  type ContainerConfig,
  type ContainerStatus,
  type ContainerInfo,
  type ContainerExecResult,
  DockerClient,
  DockerError,
  ContainerManager,
  ContainerManagerError,
  isLocalhostUrl,
  toDockerHostUrl,
} from './container/index.js';

// Error utilities
export { createPluginError, HardhatPluginError } from './errors/index.js';

// Web3 utilities
export {
  type Hex,
  type Chain,
  type WalletClient,
  type HttpTransport,
  type PrivateKeyAccount,
  type ChainConfig,
  encodeFunctionData,
  encodeAbiParameters,
  getAddress,
  createChain,
  createWalletClientFromKey,
  sendRawTransaction,
  getCode,
  getTransactionReceipt,
  waitForReceipt,
  computeCreate2Address,
} from './web3/index.js';

// Testing utilities
export { useFixtureProject } from './testing/index.js';

// Task helpers
export {
  resolveExternalRpcUrl,
  writeProgress,
  clearProgress,
  generateNetworkName,
  withEphemeralNode,
  type EphemeralNodeContext,
  type EphemeralNodeOptions,
} from './task-helpers/index.js';
