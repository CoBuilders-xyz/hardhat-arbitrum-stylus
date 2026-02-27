import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildNodeTestArgs } from '../src/services/container/node-test-args.js';

describe('buildNodeTestArgs', () => {
  it('uses current defaults and appends files', () => {
    const args = buildNodeTestArgs(['test/a.test.ts'], {
      only: false,
      grep: undefined,
    });

    assert.deepEqual(args, [
      '--test',
      '--test-concurrency=1',
      '--test-reporter=spec',
      'test/a.test.ts',
    ]);
  });

  it('maps only and grep flags', () => {
    const args = buildNodeTestArgs(['test/a.test.ts', 'test/b.test.ts'], {
      only: true,
      grep: 'Stylus.*Counter',
    });

    assert.deepEqual(args, [
      '--test',
      '--test-concurrency=1',
      '--test-reporter=spec',
      '--test-only',
      '--test-name-pattern=Stylus.*Counter',
      'test/a.test.ts',
      'test/b.test.ts',
    ]);
  });
});
