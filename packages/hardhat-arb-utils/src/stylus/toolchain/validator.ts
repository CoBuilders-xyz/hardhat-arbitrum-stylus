import { createPluginError } from '../../errors/index.js';

import { execAsync } from '../exec.js';

const WASM_TARGET = 'wasm32-unknown-unknown';

/**
 * Toolchain validation result for a specific version.
 */
export interface ToolchainValidationResult {
  version: string;
  toolchainInstalled: boolean;
  wasmTargetInstalled: boolean;
}

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
 * Validate a single toolchain and return the result without throwing.
 *
 * @param version - The toolchain version (e.g., "1.93.0")
 * @returns Validation result with status of toolchain and target
 */
export async function checkToolchain(
  version: string,
): Promise<ToolchainValidationResult> {
  const toolchainInstalled = await isToolchainInstalled(version);
  const wasmTargetInstalled = toolchainInstalled
    ? await isWasmTargetInstalled(version)
    : false;

  return {
    version,
    toolchainInstalled,
    wasmTargetInstalled,
  };
}

/**
 * Validate all required toolchains before compilation.
 * Checks rustup, cargo-stylus, and all toolchains with their WASM targets.
 *
 * @param versions - Array of unique toolchain versions required
 * @throws HardhatPluginError with instructions if any requirement is not met
 */
export async function validateAllToolchains(versions: string[]): Promise<void> {
  // Check if rustup is available
  try {
    await execAsync('rustup --version');
  } catch {
    throw createPluginError(
      'rustup is not installed. Please install rustup from https://rustup.rs/',
    );
  }

  // Check if cargo-stylus is installed
  const cargoStylusInstalled = await isCargoStylusInstalled();
  if (!cargoStylusInstalled) {
    throw createPluginError(
      'cargo-stylus is not installed. Run: cargo install cargo-stylus',
    );
  }

  // Check all toolchains in parallel
  const results = await Promise.all(versions.map(checkToolchain));

  // Collect missing toolchains and targets
  const missingToolchains = results.filter((r) => !r.toolchainInstalled);
  const missingTargets = results.filter(
    (r) => r.toolchainInstalled && !r.wasmTargetInstalled,
  );

  if (missingToolchains.length === 0 && missingTargets.length === 0) {
    return; // All good
  }

  // Build error message with install instructions
  const lines: string[] = ['Missing Rust toolchain requirements:'];

  if (missingToolchains.length > 0) {
    lines.push('');
    lines.push('The following toolchains are not installed:');
    for (const { version } of missingToolchains) {
      lines.push(`  - ${version}`);
    }
    lines.push('');
    lines.push('Install toolchains and targets with:');
    for (const { version } of missingToolchains) {
      lines.push(`  rustup install ${version}`);
      lines.push(`  rustup +${version} target add ${WASM_TARGET}`);
    }
  }

  if (missingTargets.length > 0) {
    lines.push('');
    lines.push(
      `The following toolchains are missing the ${WASM_TARGET} target:`,
    );
    for (const { version } of missingTargets) {
      lines.push(`  - ${version}`);
    }
    lines.push('');
    lines.push('Install targets with:');
    for (const { version } of missingTargets) {
      lines.push(`  rustup +${version} target add ${WASM_TARGET}`);
    }
  }

  throw createPluginError(lines.join('\n'));
}
