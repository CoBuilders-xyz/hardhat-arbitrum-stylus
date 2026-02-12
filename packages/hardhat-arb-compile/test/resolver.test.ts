import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveStylusCompileConfig } from '../src/config/resolver.js';

describe('Config Resolver', () => {
  it('returns defaults when no config provided', () => {
    const config = resolveStylusCompileConfig();

    assert.equal(config.useHostToolchain, false);
  });

  it('returns defaults when empty config provided', () => {
    const config = resolveStylusCompileConfig({});

    assert.equal(config.useHostToolchain, false);
  });

  it('uses provided useHostToolchain value', () => {
    const config = resolveStylusCompileConfig({ useHostToolchain: true });

    assert.equal(config.useHostToolchain, true);
  });

  it('uses false when explicitly set', () => {
    const config = resolveStylusCompileConfig({ useHostToolchain: false });

    assert.equal(config.useHostToolchain, false);
  });
});
