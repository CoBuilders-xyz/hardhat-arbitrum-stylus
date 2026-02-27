import path from 'node:path';

import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import {
  generateTempContainerName,
  registerTempContainer,
  cleanupTempContainer,
  generateRandomPort,
} from '@cobuilders/hardhat-arb-node';
import { DockerClient } from '@cobuilders/hardhat-arb-utils';
import {
  writeProgress,
  clearProgress,
  withEphemeralNode,
  type EphemeralNodeContext,
} from '@cobuilders/hardhat-arb-utils/task-helpers';

import {
  discoverStylusContracts,
  ensureVolumes,
  cleanCacheVolumes,
  ensureCompileImage,
  validateAllToolchains,
} from '@cobuilders/hardhat-arb-utils/stylus';

import { compileHost } from '../../services/compiler/host.js';
import { compileContainer } from '../../services/compiler/container.js';

interface CompileTaskArgs {
  contracts: string;
  host: boolean;
  sol: boolean;
  stylus: boolean;
  cleanCache: boolean;
}

/** Prefix for compile networks */
const COMPILE_NETWORK_PREFIX = 'stylus-compile-net-';

/** Shared ephemeral node options for compile tasks */
const EPHEMERAL_NODE_OPTS = {
  context: 'compilation',
  networkPrefix: COMPILE_NETWORK_PREFIX,
  generateTempContainerName,
  registerTempContainer,
  cleanupTempContainer,
  generateRandomPort,
};

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
 * Compile Stylus contracts using host Rust toolchain.
 */
async function compileStylusContractsHost(
  hre: HardhatRuntimeEnvironment,
  discoveredContracts: Array<{ name: string; path: string; toolchain: string }>,
): Promise<{ successful: number; failed: number }> {
  // Validate all required toolchains before starting compilation
  const uniqueToolchains = [
    ...new Set(discoveredContracts.map((c) => c.toolchain)),
  ];
  console.log('Validating toolchain requirements...');
  await validateAllToolchains(uniqueToolchains);
  console.log('All toolchains ready.\n');

  return withEphemeralNode(
    hre,
    { ...EPHEMERAL_NODE_OPTS, needsDockerNetwork: false },
    async (ctx: EphemeralNodeContext) => {
      const results: { name: string; success: boolean; error?: string }[] = [];
      const artifactsDir = hre.config.paths.artifacts;

      for (const contract of discoveredContracts) {
        console.log(`Compiling ${contract.name}...`);

        try {
          const result = await compileHost(
            contract.path,
            contract.toolchain,
            contract.name,
            {
              onProgress: (line: string) => {
                writeProgress(line);
              },
              artifactsDir,
              endpoint: ctx.rpcUrl,
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
          const message =
            error instanceof Error ? error.message : String(error);
          results.push({
            name: contract.name,
            success: false,
            error: message,
          });
          console.log(`  ✗ ${contract.name} failed to compile`);
          console.log(`    Error: ${message}`);
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      return { successful, failed };
    },
  );
}

/**
 * Compile Stylus contracts using Docker containers.
 */
async function compileStylusContractsContainer(
  hre: HardhatRuntimeEnvironment,
  discoveredContracts: Array<{ name: string; path: string; toolchain: string }>,
): Promise<{ successful: number; failed: number }> {
  const client = new DockerClient();

  // Ensure cache volumes exist
  const volumeResult = await ensureVolumes(client);
  if (volumeResult.created.length > 0) {
    console.log('Creating cache volumes for faster compilations...');
    console.log(`  Created: ${volumeResult.created.join(', ')}`);
    console.log(
      '  (These volumes cache Rust toolchains. Run --clean-cache to remove them)',
    );
    console.log('');
  }

  // Build the base compile image (if not already built)
  console.log('Preparing compile image...');
  const wasBuilt = await ensureCompileImage((msg: string) => {
    writeProgress(msg);
  });
  clearProgress();
  if (wasBuilt) {
    console.log('  Compile image built successfully.');
    console.log(
      '  (This image is cached - subsequent compilations will be faster)',
    );
  } else {
    console.log('  Using cached compile image.');
  }
  console.log('');

  return withEphemeralNode(
    hre,
    { ...EPHEMERAL_NODE_OPTS, needsDockerNetwork: true },
    async (ctx: EphemeralNodeContext) => {
      const results: { name: string; success: boolean; error?: string }[] = [];
      const artifactsDir = hre.config.paths.artifacts;
      const preparedToolchains = new Set<string>();

      for (const contract of discoveredContracts) {
        console.log(`Compiling ${contract.name}...`);

        try {
          const result = await compileContainer(
            contract.path,
            contract.toolchain,
            contract.name,
            {
              onProgress: (line: string) => {
                writeProgress(line);
              },
              artifactsDir,
              network: ctx.container.network,
              nodeContainerName: ctx.container.nodeContainerName,
              rpcEndpoint: ctx.container.rpcEndpoint,
              useHostGateway: ctx.container.useHostGateway,
              preparedToolchains,
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
          const message =
            error instanceof Error ? error.message : String(error);
          results.push({
            name: contract.name,
            success: false,
            error: message,
          });
          console.log(`  ✗ ${contract.name} failed to compile`);
          console.log(`    Error: ${message}`);
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      return { successful, failed };
    },
  );
}

/**
 * Compile Stylus contracts.
 */
async function compileStylusContracts(
  hre: HardhatRuntimeEnvironment,
  contractFilter: string[] | undefined,
  useHostToolchain: boolean,
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
    `\nCompiling with ${useHostToolchain ? 'host toolchain' : 'Docker container'}...\n`,
  );

  if (useHostToolchain) {
    return compileStylusContractsHost(hre, discoveredContracts);
  } else {
    return compileStylusContractsContainer(hre, discoveredContracts);
  }
}

const taskCompile: NewTaskActionFunction<CompileTaskArgs> = async (
  { contracts, host, sol, stylus, cleanCache },
  hre: HardhatRuntimeEnvironment,
) => {
  // Handle --clean-cache flag
  if (cleanCache) {
    console.log('Cleaning Stylus compilation cache...');
    const { removed, notFound } = await cleanCacheVolumes();
    if (removed.length > 0) {
      console.log(`  Removed: ${removed.join(', ')}`);
    }
    if (notFound.length > 0 && removed.length === 0) {
      console.log('  No cache volumes found.');
    }
    console.log('Cache cleaned.\n');
    // If only --clean-cache was provided, exit early
    if (!contracts && !sol && !stylus) {
      return;
    }
  }

  const useHostToolchain = host || hre.config.stylus.compile.useHostToolchain;

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
      useHostToolchain,
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
