import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { withScopedEnv } from '../src/services/runtime/scoped-env.js';

describe('withScopedEnv', () => {
  it('restores absent env vars after success', async () => {
    const key = 'HARDHAT_ARB_TEST_SCOPED_ENV_ABSENT';
    delete process.env[key];

    await withScopedEnv({ [key]: 'during' }, async () => {
      assert.equal(process.env[key], 'during');
    });

    assert.equal(process.env[key], undefined);
  });

  it('restores existing env vars after success', async () => {
    const key = 'HARDHAT_ARB_TEST_SCOPED_ENV_EXISTING';
    process.env[key] = 'before';

    try {
      await withScopedEnv({ [key]: 'during' }, async () => {
        assert.equal(process.env[key], 'during');
      });

      assert.equal(process.env[key], 'before');
    } finally {
      delete process.env[key];
    }
  });

  it('restores values after errors and supports scoped deletion', async () => {
    const key = 'HARDHAT_ARB_TEST_SCOPED_ENV_DELETE';
    process.env[key] = 'before';

    try {
      await assert.rejects(
        withScopedEnv({ [key]: null }, async () => {
          assert.equal(process.env[key], undefined);
          throw new Error('boom');
        }),
        /boom/,
      );

      assert.equal(process.env[key], 'before');
    } finally {
      delete process.env[key];
    }
  });
});
