import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

import { buildNodeTestArgs } from '../container/node-test-args.js';
import { spawnNodeTests } from '../container/spawn-node-tests.js';
import { resolveTestFiles } from '../container/test-files.js';
import { buildNodeOptionsWithTsxImport } from '../runtime/node-options.js';
import { withScopedEnv } from '../runtime/scoped-env.js';

export interface ContainerRunnerOpts {
  testFiles: string[];
  only: boolean;
  grep: string | undefined;
  noCompile: boolean;
}

interface ContainerRunnerDeps {
  resolveTestFiles: typeof resolveTestFiles;
  buildNodeOptionsWithTsxImport: typeof buildNodeOptionsWithTsxImport;
  buildNodeTestArgs: typeof buildNodeTestArgs;
  spawnNodeTests: typeof spawnNodeTests;
  warn: typeof console.warn;
  log: typeof console.log;
}

const defaultContainerRunnerDeps: ContainerRunnerDeps = {
  resolveTestFiles,
  buildNodeOptionsWithTsxImport,
  buildNodeTestArgs,
  spawnNodeTests,
  warn: console.warn,
  log: console.log,
};

/**
 * Container mode bypasses the Hardhat runner and spawns node --test
 * with --test-concurrency=1 to avoid overwhelming Docker with parallel
 * devnode + compilation containers.
 */
export async function runContainerMode(
  hre: HardhatRuntimeEnvironment,
  opts: ContainerRunnerOpts,
  deps: ContainerRunnerDeps = defaultContainerRunnerDeps,
): Promise<void> {
  deps.warn(
    'Hardhat test runner executes all tests concurrently. ' +
      'Spinning up parallel Docker containers for devnodes and Stylus compilation ' +
      'is very resource intensive, so arb:test uses Node.js test runner with ' +
      'concurrency of 1 (sequential). Tests will run slower.\n' +
      'For faster parallel execution, use --host flag with a local Rust toolchain.\n',
  );

  const envUpdates = {
    HH_TEST: 'true',
    NODE_OPTIONS: await deps.buildNodeOptionsWithTsxImport(process.env.NODE_OPTIONS),
    ...(process.env.NODE_ENV === undefined ? { NODE_ENV: 'test' } : {}),
  };

  await withScopedEnv(envUpdates, async () => {
    if (!opts.noCompile) {
      await hre.tasks.getTask('build').run({ noTests: true });
      deps.log();
    }

    const files = await deps.resolveTestFiles(hre, opts.testFiles);
    if (files.length === 0) return;

    const args = deps.buildNodeTestArgs(files, opts);
    const result = await deps.spawnNodeTests(args);

    if (result.signal !== null) {
      process.exitCode = 1;
      throw createPluginError(
        `Node.js test runner terminated by signal ${result.signal}.`,
      );
    }

    if (result.code !== 0) {
      process.exitCode = 1;
    }
  });
}
