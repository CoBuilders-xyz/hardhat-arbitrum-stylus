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
  sol: boolean;
  stylus: boolean;
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

/**
 * Compile Solidity contracts using the default Hardhat compile task.
 */
async function compileSolidityContracts(
  hre: HardhatRuntimeEnvironment,
): Promise<void> {
  console.log('\n--- Solidity Compilation ---\n');
  await hre.tasks.getTask('compile').run({ quiet: false });
}

/**
 * Compile Stylus contracts.
 */
async function compileStylusContracts(
  hre: HardhatRuntimeEnvironment,
  contractFilter: string[] | undefined,
  useLocalRust: boolean,
): Promise<{ successful: number; failed: number }> {
  console.log('\n--- Stylus Compilation ---\n');

  const contractsDir = path.join(hre.config.paths.root, 'contracts');
  console.log(`Discovering Stylus contracts in ${contractsDir}...`);

  const discoveredContracts = await discoverStylusContracts(contractsDir, {
    contracts: contractFilter,
  });

  if (discoveredContracts.length === 0) {
    console.log('No Stylus contracts found.');
    return { successful: 0, failed: 0 };
  }

  console.log(`Found ${discoveredContracts.length} Stylus contract(s):\n`);
  for (const contract of discoveredContracts) {
    console.log(`  - ${contract.name} (toolchain: ${contract.toolchain})`);
  }

  console.log(
    `\nCompiling with ${useLocalRust ? 'local Rust' : 'Docker container'}...\n`,
  );

  if (!useLocalRust) {
    console.log('Container mode not yet implemented. Use --local flag.');
    return { successful: 0, failed: 0 };
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
      return { successful: 0, failed: discoveredContracts.length };
    }
  }

  const results: { name: string; success: boolean; error?: string }[] = [];
  const artifactsDir = hre.config.paths.artifacts;

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
            artifactsDir,
          },
        );
        clearProgress();
        results.push({ name: contract.name, success: result.success });
        console.log(`  ✓ ${contract.name} compiled successfully`);
        console.log(`    WASM: ${result.wasmPath}`);
        if (result.artifactPath) {
          console.log(`    Artifact: ${result.artifactPath}`);
        }
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

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return { successful, failed };
}

const taskCompile: NewTaskActionFunction<CompileTaskArgs> = async (
  { contracts, local, sol, stylus },
  hre: HardhatRuntimeEnvironment,
) => {
  const useLocalRust = local || hre.config.stylusCompile.useLocalRust;

  // Parse contract names if provided (only applies to Stylus)
  const contractFilter = contracts
    ? contracts.split(',').map((c) => c.trim())
    : undefined;

  // Determine what to compile
  // Default: compile both
  // --sol: compile only Solidity
  // --stylus: compile only Stylus
  const shouldCompileSolidity = !stylus || sol;
  const shouldCompileStylus = !sol || stylus;

  let soliditySuccess = true;
  let stylusSuccessful = 0;
  let stylusFailed = 0;

  // Compile Solidity contracts
  if (shouldCompileSolidity) {
    try {
      await compileSolidityContracts(hre);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Solidity compilation failed: ${message}`);
      soliditySuccess = false;
    }
  }

  // Compile Stylus contracts
  if (shouldCompileStylus) {
    const result = await compileStylusContracts(
      hre,
      contractFilter,
      useLocalRust,
    );
    stylusSuccessful = result.successful;
    stylusFailed = result.failed;
  }

  // Summary
  console.log('\n=== Compilation Summary ===\n');

  if (shouldCompileSolidity) {
    console.log(`Solidity: ${soliditySuccess ? 'Success' : 'Failed'}`);
  }

  if (shouldCompileStylus) {
    console.log(
      `Stylus: ${stylusSuccessful} succeeded, ${stylusFailed} failed`,
    );
  }

  if (!soliditySuccess || stylusFailed > 0) {
    process.exitCode = 1;
  }
};

export default taskCompile;
