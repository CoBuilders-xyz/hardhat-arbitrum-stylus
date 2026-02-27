import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import { runHostMode, validateHostDeps } from '../src/services/runners/host.js';
import { clearValidatedToolchainSetCache } from '../src/state/preflight-cache.js';

function createHreForHost(root = '/tmp/project'): HardhatRuntimeEnvironment {
  return {
    config: {
      paths: { root },
    },
    tasks: {
      getTask: () => ({
        run: async () => {},
      }),
    },
  } as unknown as HardhatRuntimeEnvironment;
}

describe('host runner', () => {
  beforeEach(() => {
    clearValidatedToolchainSetCache();
  });

  afterEach(() => {
    clearValidatedToolchainSetCache();
  });

  it('caches successful toolchain validation by toolchain set', async () => {
    const validateCalls: string[][] = [];
    const hre = createHreForHost('/tmp/project-cache');

    const deps = {
      discoverStylusContracts: async () => [
        { name: 'a', path: '/tmp/a', toolchain: '1.82.0' },
        { name: 'b', path: '/tmp/b', toolchain: '1.82.0' },
        { name: 'c', path: '/tmp/c', toolchain: '1.83.0' },
      ],
      validateAllToolchains: async (versions: string[]) => {
        validateCalls.push(versions);
      },
    };

    await validateHostDeps(hre, deps);
    await validateHostDeps(hre, deps);

    assert.equal(validateCalls.length, 1);
    assert.deepEqual(validateCalls[0], ['1.82.0', '1.83.0']);
  });

  it('maps host args to Hardhat nodejs test task', async () => {
    const taskCalls: unknown[] = [];

    const hre = {
      config: {
        paths: { root: '/tmp/project-host-run' },
      },
      tasks: {
        getTask: (id: unknown) => {
          assert.deepEqual(id, ['test', 'nodejs']);
          return {
            run: async (args: unknown) => {
              taskCalls.push(args);
            },
          };
        },
      },
    } as unknown as HardhatRuntimeEnvironment;

    const deps = {
      discoverStylusContracts: async () => [],
      validateAllToolchains: async (_versions: string[]) => {
        throw new Error('should not be called');
      },
    };

    await runHostMode(
      hre,
      {
        testFiles: ['test/counter.test.ts'],
        only: true,
        grep: 'Counter',
        noCompile: false,
      },
      deps,
    );

    assert.deepEqual(taskCalls, [
      {
        testFiles: ['test/counter.test.ts'],
        only: true,
        grep: 'Counter',
        noCompile: false,
        testSummaryIndex: 0,
      },
    ]);
  });
});
