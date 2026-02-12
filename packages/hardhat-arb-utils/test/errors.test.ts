import { describe, it } from 'node:test';
import assert from 'node:assert';

import { createPluginError, HardhatPluginError } from '../src/errors/index.js';

describe('createPluginError', () => {
  it('should create a HardhatPluginError with the correct plugin ID', () => {
    const error = createPluginError('Test error message');

    assert.ok(
      HardhatPluginError.isHardhatPluginError(error),
      'Should be a HardhatPluginError',
    );
    assert.strictEqual(error.pluginId, '@cobuilders/hardhat-arbitrum-stylus');
    assert.strictEqual(error.message, 'Test error message');
  });

  it('should include the cause when provided', () => {
    const cause = new Error('Original error');
    const error = createPluginError('Wrapper error', cause);

    assert.ok(
      HardhatPluginError.isHardhatPluginError(error),
      'Should be a HardhatPluginError',
    );
    assert.strictEqual(error.cause, cause);
  });

  it('should work without a cause', () => {
    const error = createPluginError('Error without cause');

    assert.strictEqual(error.cause, undefined);
  });
});
