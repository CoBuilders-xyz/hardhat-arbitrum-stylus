import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import { runContainerMode } from '../src/services/runners/container.js';

function createHre(): HardhatRuntimeEnvironment {
  return {
    tasks: {
      getTask: (id: unknown) => {
        assert.equal(id, 'build');
        return {
          run: async (_args: unknown) => {},
        };
      },
    },
  } as unknown as HardhatRuntimeEnvironment;
}

describe('container runner', () => {
  let originalExitCode: typeof process.exitCode;

  beforeEach(() => {
    originalExitCode = process.exitCode;
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    delete process.env.HH_TEST;
    delete process.env.NODE_OPTIONS;
    delete process.env.NODE_ENV;
  });

  it('scopes env vars and restores them after a successful run', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NODE_OPTIONS = '--trace-warnings';

    let envSeenInSpawn:
      | {
          hhTest: string | undefined;
          nodeEnv: string | undefined;
          nodeOptions: string | undefined;
        }
      | undefined;
    let buildRuns = 0;
    let argsPassedToSpawn: string[] | undefined;

    const hre = {
      tasks: {
        getTask: (id: unknown) => {
          assert.equal(id, 'build');
          return {
            run: async (args: unknown) => {
              buildRuns += 1;
              assert.deepEqual(args, { noTests: true });
            },
          };
        },
      },
    } as unknown as HardhatRuntimeEnvironment;

    await runContainerMode(
      hre,
      { testFiles: [], only: false, grep: undefined, noCompile: false },
      {
        warn: () => {},
        log: () => {},
        buildNodeOptionsWithTsxImport: async (existing) =>
          `${existing ?? ''} --import "file:///tsx-loader.mjs"`.trim(),
        resolveTestFiles: async () => ['test/a.test.ts'],
        buildNodeTestArgs: (files) => ['--test', ...files],
        spawnNodeTests: async (args) => {
          argsPassedToSpawn = args;
          envSeenInSpawn = {
            hhTest: process.env.HH_TEST,
            nodeEnv: process.env.NODE_ENV,
            nodeOptions: process.env.NODE_OPTIONS,
          };
          return { code: 0, signal: null };
        },
      },
    );

    assert.equal(buildRuns, 1);
    assert.deepEqual(argsPassedToSpawn, ['--test', 'test/a.test.ts']);
    assert.deepEqual(envSeenInSpawn, {
      hhTest: 'true',
      nodeEnv: 'development',
      nodeOptions: '--trace-warnings --import "file:///tsx-loader.mjs"',
    });

    assert.equal(process.env.HH_TEST, undefined);
    assert.equal(process.env.NODE_ENV, 'development');
    assert.equal(process.env.NODE_OPTIONS, '--trace-warnings');
  });

  it('fails when the node test runner exits due to signal and restores env', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NODE_OPTIONS = '--trace-warnings';

    const hre = createHre();

    await assert.rejects(
      runContainerMode(
        hre,
        { testFiles: [], only: false, grep: undefined, noCompile: true },
        {
          warn: () => {},
          log: () => {},
          buildNodeOptionsWithTsxImport: async (existing) =>
            `${existing ?? ''} --import "file:///tsx-loader.mjs"`.trim(),
          resolveTestFiles: async () => ['test/a.test.ts'],
          buildNodeTestArgs: (files) => ['--test', ...files],
          spawnNodeTests: async () => ({ code: null, signal: 'SIGTERM' }),
        },
      ),
      /terminated by signal SIGTERM/,
    );

    assert.equal(process.exitCode, 1);
    assert.equal(process.env.HH_TEST, undefined);
    assert.equal(process.env.NODE_ENV, 'development');
    assert.equal(process.env.NODE_OPTIONS, '--trace-warnings');
  });
});
