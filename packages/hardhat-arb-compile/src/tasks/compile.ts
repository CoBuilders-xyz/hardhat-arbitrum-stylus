import path from 'node:path';

import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import { DockerClient } from '@cobuilders/hardhat-arb-utils';

import { discoverStylusContracts } from '../utils/discovery/index.js';
import { compileLocal } from '../utils/compiler/local.js';

/** Default container name for the Arbitrum node */
const CONTAINER_NAME = 'nitro-devnode';

interface CompileTaskArgs {
  contracts: string;
  local: boolean;
}

/**
 * Clear the current line and write new content.
 * Uses carriage return to overwrite the line for progress updates.
 */
function writeProgress(line: string): void {
  const maxWidth = process.stdout.columns || 80;
  // Truncate long lines to fit terminal width
  const content = `    ${line}`;
  const truncated =
    content.length > maxWidth
      ? content.slice(0, maxWidth - 3) + '...'
      : content;
  // Pad with spaces to clear any previous longer content
  const padded = truncated.padEnd(maxWidth, ' ');
  process.stdout.write(`\r${padded}`);
}

/**
 * Clear the progress line.
 */
function clearProgress(): void {
  const width = process.stdout.columns || 80;
  process.stdout.write('\r' + ' '.repeat(width) + '\r');
}

/**
 * Check if an Arbitrum node is running.
 */
async function isNodeRunning(): Promise<boolean> {
  const client = new DockerClient();
  const containerId = await client.findByName(CONTAINER_NAME);
  if (!containerId) {
    return false;
  }
  return client.isRunning(containerId);
}

const taskCompile: NewTaskActionFunction<CompileTaskArgs> = async (
  { contracts, local },
  hre: HardhatRuntimeEnvironment,
) => {
  const useLocalRust = local || hre.config.stylusCompile.useLocalRust;

  // Parse contract names if provided
  const contractFilter = contracts
    ? contracts.split(',').map((c) => c.trim())
    : undefined;

  // Discover contracts
  const contractsDir = path.join(hre.config.paths.root, 'contracts');
  console.log(`\nDiscovering Stylus contracts in ${contractsDir}...`);

  const discoveredContracts = await discoverStylusContracts(contractsDir, {
    contracts: contractFilter,
  });

  if (discoveredContracts.length === 0) {
    console.log('No Stylus contracts found.');
    return;
  }

  console.log(`Found ${discoveredContracts.length} Stylus contract(s):\n`);
  for (const contract of discoveredContracts) {
    console.log(`  - ${contract.name} (toolchain: ${contract.toolchain})`);
  }

  // Compile contracts
  console.log(
    `\nCompiling with ${useLocalRust ? 'local Rust' : 'Docker container'}...\n`,
  );

  if (!useLocalRust) {
    console.log('Container mode not yet implemented. Use --local flag.');
    return;
  }

  // Check if node is running, start one if needed
  let nodeStartedByUs = false;
  const nodeRunning = await isNodeRunning();

  if (!nodeRunning) {
    console.log('Starting Arbitrum node for compilation...');
    try {
      await hre.tasks.getTask(['arb:node', 'start']).run({
        quiet: true,
        detach: true,
        stylusReady: false,
        name: '',
        httpPort: 0,
        wsPort: 0,
      });
      nodeStartedByUs = true;
      console.log('Node started.\n');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Failed to start node: ${message}`);
      console.log(
        'cargo stylus check requires a running Arbitrum node. Please start one manually.',
      );
      process.exitCode = 1;
      return;
    }
  }

  const results: { name: string; success: boolean; error?: string }[] = [];

  try {
    for (const contract of discoveredContracts) {
      console.log(`Compiling ${contract.name}...`);

      try {
        const result = await compileLocal(
          contract.path,
          contract.toolchain,
          contract.name,
          {
            onProgress: (line) => {
              writeProgress(line);
            },
          },
        );
        clearProgress();
        results.push({ name: contract.name, success: result.success });
        console.log(`  ✓ ${contract.name} compiled successfully`);
        console.log(`    WASM: ${result.wasmPath}`);
      } catch (error) {
        clearProgress();
        const message = error instanceof Error ? error.message : String(error);
        results.push({ name: contract.name, success: false, error: message });
        console.log(`  ✗ ${contract.name} failed to compile`);
        console.log(`    Error: ${message}`);
      }
    }
  } finally {
    // Stop the node if we started it
    if (nodeStartedByUs) {
      console.log('\nStopping Arbitrum node...');
      try {
        await hre.tasks.getTask(['arb:node', 'stop']).run({
          quiet: true,
          name: '',
        });
      } catch {
        // Ignore errors when stopping
      }
    }
  }

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(
    `\nCompilation complete: ${successful} succeeded, ${failed} failed`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
};

export default taskCompile;
