import { spawn } from 'node:child_process';
import type { ChildProcess, SpawnOptions } from 'node:child_process';

import { createPluginError } from '@cobuilders/hardhat-arb-utils/errors';

export interface SpawnNodeTestResult {
  code: number | null;
  signal: NodeJS.Signals | null;
}

export type SpawnProcessFn = (
  command: string,
  args: readonly string[],
  options: SpawnOptions,
) => ChildProcess;

export interface SpawnNodeTestsDeps {
  spawnProcess?: SpawnProcessFn;
}

export async function spawnNodeTests(
  args: string[],
  deps: SpawnNodeTestsDeps = {},
): Promise<SpawnNodeTestResult> {
  const spawnProcess = deps.spawnProcess ?? spawn;

  return new Promise<SpawnNodeTestResult>((resolve, reject) => {
    let child: ChildProcess;

    try {
      child = spawnProcess('node', args, { stdio: 'inherit' });
    } catch (error) {
      reject(
        createPluginError(
          'Failed to start Node.js test runner (spawn threw synchronously).',
          error instanceof Error ? error : undefined,
        ),
      );
      return;
    }

    child.on('exit', (code, signal) => {
      resolve({ code, signal });
    });

    child.on('error', (error) => {
      reject(createPluginError('Failed to start Node.js test runner.', error));
    });
  });
}
