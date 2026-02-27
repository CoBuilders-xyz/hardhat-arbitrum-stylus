import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { resolveStylusSubConfig } from '../src/config/resolver.js';

interface TestConfig {
  useHostToolchain: boolean;
}

interface TestUserConfig {
  useHostToolchain?: boolean;
}

const DEFAULTS: TestConfig = {
  useHostToolchain: false,
};

describe('resolveStylusSubConfig', () => {
  it('returns defaults when no user config provided', () => {
    const result = resolveStylusSubConfig<TestConfig, TestUserConfig>(
      undefined,
      DEFAULTS,
    );
    assert.deepStrictEqual(result, { useHostToolchain: false });
  });

  it('returns defaults when empty user config provided', () => {
    const result = resolveStylusSubConfig<TestConfig, TestUserConfig>(
      {},
      DEFAULTS,
    );
    assert.deepStrictEqual(result, { useHostToolchain: false });
  });

  it('overrides defaults with user values', () => {
    const result = resolveStylusSubConfig<TestConfig, TestUserConfig>(
      { useHostToolchain: true },
      DEFAULTS,
    );
    assert.deepStrictEqual(result, { useHostToolchain: true });
  });

  it('does not mutate the defaults object', () => {
    const defaults = { useHostToolchain: false };
    resolveStylusSubConfig<TestConfig, TestUserConfig>(
      { useHostToolchain: true },
      defaults,
    );
    assert.strictEqual(defaults.useHostToolchain, false);
  });
});
