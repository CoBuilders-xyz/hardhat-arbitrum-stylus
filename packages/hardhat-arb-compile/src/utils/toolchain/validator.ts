import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import { execAsync } from '../exec.js';

const WASM_TARGET = 'wasm32-unknown-unknown';

/**
 * Check if a specific Rust toolchain is installed.
 *
 * @param version - The toolchain version (e.g., "1.93.0")
 * @returns true if installed, false otherwise
 */
export async function isToolchainInstalled(version: string): Promise<boolean> {
  try {
    await execAsync(`rustc +${version} --version`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the wasm32-unknown-unknown target is installed for a toolchain.
 *
 * @param version - The toolchain version (e.g., "1.93.0")
 * @returns true if target is installed, false otherwise
 */
export async function isWasmTargetInstalled(version: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `rustup +${version} target list --installed`,
    );
    return stdout.includes(WASM_TARGET);
  } catch {
    return false;
  }
}

/**
 * Check if cargo-stylus is installed.
 *
 * @returns true if installed, false otherwise
 */
export async function isCargoStylusInstalled(): Promise<boolean> {
  try {
    await execAsync('cargo stylus --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that all requirements for local Rust compilation are met.
 *
 * @param version - The toolchain version (e.g., "1.93.0")
 * @throws HardhatPluginError if any requirement is not met
 */
export async function validateLocalToolchain(version: string): Promise<void> {
  // Check if rustup is available
  try {
    await execAsync('rustup --version');
  } catch {
    throw createPluginError(
      'rustup is not installed. Please install rustup from https://rustup.rs/',
    );
  }

  // Check if the required toolchain is installed
  const toolchainInstalled = await isToolchainInstalled(version);
  if (!toolchainInstalled) {
    throw createPluginError(
      `Rust toolchain ${version} is not installed. Run: rustup install ${version}`,
    );
  }

  // Check if the wasm target is installed
  const wasmInstalled = await isWasmTargetInstalled(version);
  if (!wasmInstalled) {
    throw createPluginError(
      `${WASM_TARGET} target not installed for toolchain ${version}. ` +
        `Run: rustup +${version} target add ${WASM_TARGET}`,
    );
  }

  // Check if cargo-stylus is installed
  const cargoStylusInstalled = await isCargoStylusInstalled();
  if (!cargoStylusInstalled) {
    throw createPluginError(
      'cargo-stylus is not installed. Run: cargo install cargo-stylus',
    );
  }
}
