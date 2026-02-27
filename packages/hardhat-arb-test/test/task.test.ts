import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';

import { runArbTestTask } from '../src/plugin/tasks/test.js';

function createHre(): HardhatRuntimeEnvironment {
  return {} as HardhatRuntimeEnvironment;
}

describe('arb:test task orchestration', () => {
  it('dispatches to container mode and resets host mode override', async () => {
    const hostModeCalls: Array<boolean | null> = [];
    let containerCalls = 0;
    let hostCalls = 0;

    await runArbTestTask(
      {
        testFiles: ['test/a.test.ts'],
        only: false,
        grep: undefined,
        noCompile: true,
        host: false,
      },
      createHre(),
      {
        setTestHostMode: (value) => {
          hostModeCalls.push(value);
        },
        runHostMode: async () => {
          hostCalls += 1;
        },
        runContainerMode: async () => {
          containerCalls += 1;
        },
      },
    );

    assert.equal(hostCalls, 0);
    assert.equal(containerCalls, 1);
    assert.deepEqual(hostModeCalls, [false, null]);
  });

  it('dispatches to host mode and resets host mode override', async () => {
    const hostModeCalls: Array<boolean | null> = [];
    let containerCalls = 0;
    let hostCalls = 0;

    await runArbTestTask(
      {
        testFiles: [],
        only: true,
        grep: 'Counter',
        noCompile: false,
        host: true,
      },
      createHre(),
      {
        setTestHostMode: (value) => {
          hostModeCalls.push(value);
        },
        runHostMode: async () => {
          hostCalls += 1;
        },
        runContainerMode: async () => {
          containerCalls += 1;
        },
      },
    );

    assert.equal(hostCalls, 1);
    assert.equal(containerCalls, 0);
    assert.deepEqual(hostModeCalls, [true, null]);
  });

  it('resets host mode override even when a runner throws', async () => {
    const hostModeCalls: Array<boolean | null> = [];

    await assert.rejects(
      runArbTestTask(
        {
          testFiles: [],
          only: false,
          grep: undefined,
          noCompile: true,
          host: false,
        },
        createHre(),
        {
          setTestHostMode: (value) => {
            hostModeCalls.push(value);
          },
          runHostMode: async () => {},
          runContainerMode: async () => {
            throw new Error('container failed');
          },
        },
      ),
      /container failed/,
    );

    assert.deepEqual(hostModeCalls, [false, null]);
  });
});
