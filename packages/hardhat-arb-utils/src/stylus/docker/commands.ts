import type { ProgressCallback } from '../../exec/index.js';
import { createPluginError } from '../../errors/index.js';

import {
  runInStylusContainer,
  type RunInStylusContainerOptions,
} from './run-container.js';

const WASM_TARGET = 'wasm32-unknown-unknown';

/**
 * Options for running Stylus commands in a Docker container.
 */
export interface StylusContainerCommandOptions extends RunInStylusContainerOptions {
  /** Callback for progress updates */
  onProgress?: ProgressCallback;
}

/**
 * Options for container toolchain preparation.
 */
export interface EnsureContainerToolchainOptions extends StylusContainerCommandOptions {
  /** Set used to avoid duplicate setup for the same toolchain within one run */
  preparedToolchains?: Set<string>;
}

/**
 * Run a Stylus command in a Docker container and normalize failures.
 */
export async function runStylusContainerCommand(
  image: string,
  contractPath: string,
  command: string[],
  failureMessage: string,
  options: StylusContainerCommandOptions = {},
): Promise<{ stdout: string; stderr: string }> {
  try {
    return await runInStylusContainer(image, contractPath, command, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw createPluginError(`${failureMessage}:\n${message}`);
  }
}

/**
 * Ensure a Rust toolchain and wasm target are available in the Stylus container.
 */
export async function ensureContainerToolchain(
  image: string,
  contractPath: string,
  toolchain: string,
  options: EnsureContainerToolchainOptions = {},
): Promise<void> {
  const { preparedToolchains, ...containerOptions } = options;

  if (preparedToolchains?.has(toolchain)) {
    return;
  }

  options.onProgress?.(`Preparing toolchain ${toolchain}...`);

  let downloadHintShown = false;
  const toolchainProgress: ProgressCallback = (line) => {
    if (
      !downloadHintShown &&
      (line.includes('downloading component') ||
        line.includes('info: downloading'))
    ) {
      options.onProgress?.(
        `Downloading toolchain ${toolchain}... (first use, will be cached)`,
      );
      downloadHintShown = true;
    }
    options.onProgress?.(line);
  };

  await runStylusContainerCommand(
    image,
    contractPath,
    ['rustup', 'toolchain', 'install', toolchain],
    `Failed to install toolchain ${toolchain}`,
    {
      ...containerOptions,
      onProgress: toolchainProgress,
    },
  );

  options.onProgress?.(`Adding ${WASM_TARGET} target for ${toolchain}...`);
  await runStylusContainerCommand(
    image,
    contractPath,
    ['rustup', 'target', 'add', WASM_TARGET, '--toolchain', toolchain],
    `Failed to add ${WASM_TARGET} target for ${toolchain}`,
    containerOptions,
  );

  preparedToolchains?.add(toolchain);
}
