import path from 'node:path';

import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import {
  generateTempContainerName,
  registerTempContainer,
  cleanupTempContainer,
  generateRandomPort,
} from '@cobuilders/hardhat-arb-node';
import {
  DockerClient,
  isLocalhostUrl,
  toDockerHostUrl,
} from '@cobuilders/hardhat-arb-utils';
import {
  resolveExternalRpcUrl,
  writeProgress,
  clearProgress,
  generateNetworkName,
} from '@cobuilders/hardhat-arb-utils/task-helpers';

import {
  discoverStylusContracts,
  ensureVolumes,
  cleanCacheVolumes,
  ensureCompileImage,
  validateAllToolchains,
} from '@cobuilders/hardhat-arb-utils/stylus';

import { compileHost } from '../utils/compiler/host.js';
import { compileContainer } from '../utils/compiler/container.js';

interface CompileTaskArgs {
  contracts: string;
  host: boolean;
  sol: boolean;
  stylus: boolean;
  cleanCache: boolean;
}

/** Prefix for compile networks */
const COMPILE_NETWORK_PREFIX = 'stylus-compile-net-';

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
  externalRpcUrl: string | null,
): Promise<{ successful: number; failed: number }> {
  // Validate all required toolchains before starting compilation
  const uniqueToolchains = [
    ...new Set(discoveredContracts.map((c) => c.toolchain)),
  ];
  console.log('Validating toolchain requirements...');
  await validateAllToolchains(uniqueToolchains);
  console.log('All toolchains ready.\n');

  // Resolve the RPC endpoint
  let endpoint: string;
  let tempContainerName: string | null = null;

  if (externalRpcUrl) {
    // Use external network - no ephemeral node needed
    endpoint = externalRpcUrl;
    console.log(`Using external network: ${endpoint}\n`);
  } else {
    // Start a temporary node for compilation on random ports
    const httpPort = generateRandomPort();
    const wsPort = httpPort + 1;
    endpoint = `http://localhost:${httpPort}`;

    console.log('Starting Arbitrum node for compilation...');
    try {
      tempContainerName = generateTempContainerName();
      registerTempContainer(tempContainerName);

      await hre.tasks.getTask(['arb:node', 'start']).run({
        quiet: true,
        detach: true,
        name: tempContainerName,
        httpPort,
        wsPort,
        dockerNetwork: '',
      });
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
        const result = await compileHost(
          contract.path,
          contract.toolchain,
          contract.name,
          {
            onProgress: (line: string) => {
              writeProgress(line);
            },
            artifactsDir,
            endpoint,
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
    // Cleanup the temporary node (only if we started one)
    if (tempContainerName) {
      console.log('\nStopping Arbitrum node...');
      await cleanupTempContainer(tempContainerName);
    }
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return { successful, failed };
}

/**
 * Compile Stylus contracts using Docker containers.
 */
async function compileStylusContractsContainer(
  hre: HardhatRuntimeEnvironment,
  discoveredContracts: Array<{ name: string; path: string; toolchain: string }>,
  externalRpcUrl: string | null,
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
    // Use progress line for build output to avoid flooding the console
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

  // Determine container compile options based on network mode
  let networkName: string | null = null;
  let tempContainerName: string | null = null;
  let containerRpcEndpoint: string | undefined;
  let useHostGateway = false;

  if (externalRpcUrl) {
    // External network - no ephemeral node or Docker network needed
    console.log(`Using external network: ${externalRpcUrl}`);

    if (isLocalhostUrl(externalRpcUrl)) {
      // Localhost URL: container can't reach host's localhost directly
      containerRpcEndpoint = toDockerHostUrl(externalRpcUrl);
      useHostGateway = true;
      console.log(
        `  Mapping to ${containerRpcEndpoint} (via host.docker.internal)\n`,
      );
    } else {
      containerRpcEndpoint = externalRpcUrl;
      console.log('');
    }
  } else {
    // Ephemeral node mode - create Docker network and start node
    networkName = generateNetworkName(COMPILE_NETWORK_PREFIX);
    console.log(`Creating Docker network: ${networkName}...`);
    await client.createNetwork(networkName);

    const httpPort = generateRandomPort();
    const wsPort = httpPort + 1;

    console.log('Starting Arbitrum node for compilation...');
    try {
      tempContainerName = generateTempContainerName();
      registerTempContainer(tempContainerName);

      await hre.tasks.getTask(['arb:node', 'start']).run({
        quiet: true,
        detach: true,
        name: tempContainerName,
        httpPort,
        wsPort,
        dockerNetwork: networkName,
      });
      console.log('Node started.\n');
    } catch (error) {
      // Cleanup network on failure
      try {
        await client.removeNetwork(networkName);
      } catch {
        // Ignore cleanup errors
      }
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
        const result = await compileContainer(
          contract.path,
          contract.toolchain,
          contract.name,
          {
            onProgress: (line: string) => {
              writeProgress(line);
            },
            artifactsDir,
            network: networkName ?? undefined,
            nodeContainerName: tempContainerName ?? undefined,
            rpcEndpoint: containerRpcEndpoint,
            useHostGateway,
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
    // Cleanup the temporary node (only if we started one)
    if (tempContainerName) {
      console.log('\nStopping Arbitrum node...');
      await cleanupTempContainer(tempContainerName);
    }

    // Cleanup the Docker network (only if we created one)
    if (networkName) {
      console.log('Removing Docker network...');
      try {
        await client.removeNetwork(networkName);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return { successful, failed };
}

/**
 * Compile Stylus contracts.
 */
async function compileStylusContracts(
  hre: HardhatRuntimeEnvironment,
  contractFilter: string[] | undefined,
  useHostToolchain: boolean,
  externalRpcUrl: string | null,
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
    return compileStylusContractsHost(hre, discoveredContracts, externalRpcUrl);
  } else {
    return compileStylusContractsContainer(
      hre,
      discoveredContracts,
      externalRpcUrl,
    );
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

  // Resolve external RPC URL if --network flag is set
  const externalRpcUrl = await resolveExternalRpcUrl(hre, 'compilation');

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
      externalRpcUrl,
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
