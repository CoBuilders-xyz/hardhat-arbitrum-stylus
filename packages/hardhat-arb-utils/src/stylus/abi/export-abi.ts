import { execWithProgress, type ProgressCallback } from '../../exec/exec.js';

/**
 * Export ABI from a Stylus contract using cargo stylus export-abi.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param toolchain - The Rust toolchain version (e.g., "1.93.0")
 * @param onProgress - Optional callback for progress updates
 * @returns The Solidity interface string
 * @throws Error if the command fails (e.g., missing toolchain, compilation error)
 */
export async function exportStylusAbi(
  contractPath: string,
  toolchain: string,
  onProgress?: ProgressCallback,
): Promise<string> {
  const { stdout } = await execWithProgress(
    `cargo +${toolchain} stylus export-abi`,
    { cwd: contractPath },
    onProgress,
  );
  return stdout;
}
