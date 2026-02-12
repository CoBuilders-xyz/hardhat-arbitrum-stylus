import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveStylusDeployConfig } from '../src/config/resolver.js';

describe('Config Resolver', () => {
  it('returns defaults when no config provided', () => {
    const config = resolveStylusDeployConfig();

    assert.equal(config.useHostToolchain, false);
  });

  it('returns defaults when empty config provided', () => {
    const config = resolveStylusDeployConfig({});

    assert.equal(config.useHostToolchain, false);
  });

  it('uses provided useHostToolchain value', () => {
    const config = resolveStylusDeployConfig({ useHostToolchain: true });

    assert.equal(config.useHostToolchain, true);
  });

  it('uses false when explicitly set', () => {
    const config = resolveStylusDeployConfig({ useHostToolchain: false });

    assert.equal(config.useHostToolchain, false);
  });
});
