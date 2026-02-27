import assert from 'node:assert/strict';
import type { ChildProcess, SpawnOptions } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { describe, it } from 'node:test';

import type { SpawnProcessFn } from '../src/services/container/spawn-node-tests.js';
import { spawnNodeTests } from '../src/services/container/spawn-node-tests.js';

function createSpawnStub(
  onSpawn: (
    child: EventEmitter,
    command: string,
    args: readonly string[],
    options: SpawnOptions,
  ) => void,
): SpawnProcessFn {
  return ((command, args, options) => {
    const child = new EventEmitter();
    onSpawn(child, command, args, options);
    return child as unknown as ChildProcess;
  }) as SpawnProcessFn;
}

describe('spawnNodeTests', () => {
  it('spawns node with inherited stdio and resolves exit codes', async () => {
    let capturedCommand = '';
    let capturedArgs: readonly string[] = [];
    let capturedStdio: unknown;

    const resultPromise = spawnNodeTests(['--test', 'test/a.test.ts'], {
      spawnProcess: createSpawnStub((child, command, args, options) => {
        capturedCommand = command;
        capturedArgs = args;
        capturedStdio = options.stdio;
        setImmediate(() => {
          child.emit('exit', 0, null);
        });
      }),
    });

    const result = await resultPromise;

    assert.equal(capturedCommand, 'node');
    assert.deepEqual(capturedArgs, ['--test', 'test/a.test.ts']);
    assert.equal(capturedStdio, 'inherit');
    assert.deepEqual(result, { code: 0, signal: null });
  });

  it('returns signal termination details', async () => {
    const result = await spawnNodeTests(['--test'], {
      spawnProcess: createSpawnStub((child) => {
        setImmediate(() => {
          child.emit('exit', null, 'SIGTERM');
        });
      }),
    });

    assert.deepEqual(result, { code: null, signal: 'SIGTERM' });
  });

  it('wraps spawn errors in plugin errors', async () => {
    await assert.rejects(
      spawnNodeTests(['--test'], {
        spawnProcess: createSpawnStub((child) => {
          setImmediate(() => {
            child.emit('error', new Error('spawn failed'));
          });
        }),
      }),
      /Failed to start Node\.js test runner/,
    );
  });
});
