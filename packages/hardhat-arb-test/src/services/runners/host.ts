import path from 'node:path';

import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import {
  discoverStylusContracts,
  validateAllToolchains,
} from '@cobuilders/hardhat-arb-utils/stylus';

import {
  getToolchainSetCacheKey,
  hasValidatedToolchainSet,
  markValidatedToolchainSet,
} from '../../state/preflight-cache.js';

export interface HostRunnerOpts {
  testFiles: string[];
  only: boolean;
  grep: string | undefined;
  noCompile: boolean;
}

interface HostPreflightDeps {
  discoverStylusContracts: typeof discoverStylusContracts;
  validateAllToolchains: typeof validateAllToolchains;
}

const defaultHostPreflightDeps: HostPreflightDeps = {
  discoverStylusContracts,
  validateAllToolchains,
};

/**
 * Check that host Rust toolchain requirements are met before running tests.
 * Discovers Stylus contracts and validates their required toolchains.
 */
export async function validateHostDeps(
  hre: HardhatRuntimeEnvironment,
  deps: HostPreflightDeps = defaultHostPreflightDeps,
): Promise<void> {
  const contractsDir = path.join(hre.config.paths.root, 'contracts');
  const contracts = await deps.discoverStylusContracts(contractsDir);

  if (contracts.length === 0) return;

  const toolchains = contracts.map((contract) => contract.toolchain);
  const cacheKey = getToolchainSetCacheKey(toolchains);

  if (cacheKey.length === 0 || hasValidatedToolchainSet(cacheKey)) {
    return;
  }

  const uniqueToolchains = cacheKey.split(',');
  await deps.validateAllToolchains(uniqueToolchains);
  markValidatedToolchainSet(cacheKey);
}

export async function runHostMode(
  hre: HardhatRuntimeEnvironment,
  opts: HostRunnerOpts,
  deps: HostPreflightDeps = defaultHostPreflightDeps,
): Promise<void> {
  await validateHostDeps(hre, deps);

  await hre.tasks.getTask(['test', 'nodejs']).run({
    testFiles: opts.testFiles,
    only: opts.only,
    grep: opts.grep,
    noCompile: opts.noCompile,
    testSummaryIndex: 0,
  });
}
