import path from 'node:path';

import type { NewTaskActionFunction } from 'hardhat/types/tasks';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import { discoverStylusContracts } from '../utils/discovery/index.js';
import { compileLocal } from '../utils/compiler/local.js';

interface CompileTaskArgs {
  contracts: string;
  local: boolean;
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

  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const contract of discoveredContracts) {
    console.log(`Compiling ${contract.name}...`);

    try {
      const result = await compileLocal(
        contract.path,
        contract.toolchain,
        contract.name,
      );
      results.push({ name: contract.name, success: result.success });
      console.log(`  ✓ ${contract.name} compiled successfully`);
      console.log(`    WASM: ${result.wasmPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ name: contract.name, success: false, error: message });
      console.log(`  ✗ ${contract.name} failed to compile`);
      console.log(`    Error: ${message}`);
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
