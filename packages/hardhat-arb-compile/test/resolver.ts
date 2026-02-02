import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveStylusCompileConfig } from '../src/config/resolver.js';

describe('Config Resolver', () => {
  it('returns defaults when no config provided', () => {
    const config = resolveStylusCompileConfig();

    assert.equal(config.useLocalRust, false);
  });

  it('returns defaults when empty config provided', () => {
    const config = resolveStylusCompileConfig({});

    assert.equal(config.useLocalRust, false);
  });

  it('uses provided useLocalRust value', () => {
    const config = resolveStylusCompileConfig({ useLocalRust: true });

    assert.equal(config.useLocalRust, true);
  });

  it('uses false when explicitly set', () => {
    const config = resolveStylusCompileConfig({ useLocalRust: false });

    assert.equal(config.useLocalRust, false);
  });
});
