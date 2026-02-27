import type { Hex } from '@cobuilders/hardhat-arb-utils';

/**
 * Result of a WASM contract deployment.
 */
export interface WasmDeployResult {
  /** Deployed contract address */
  address: Hex;
}

/** Callback for progress updates during deployment */
export type ProgressCallback = (line: string) => void;
