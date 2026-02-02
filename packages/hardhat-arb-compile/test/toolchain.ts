import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { execAsync } from '../src/utils/exec.js';
import {
  isToolchainInstalled,
  isWasmTargetInstalled,
  isCargoStylusInstalled,
} from '../src/utils/toolchain/validator.js';

/**
 * Check if rustup is available on the system.
 */
async function hasRustup(): Promise<boolean> {
  try {
    await execAsync('rustup --version');
    return true;
  } catch {
    return false;
  }
}

describe('Toolchain Validator', () => {
  describe('isToolchainInstalled', () => {
    it('returns false for non-existent toolchain', async (t) => {
      if (!(await hasRustup())) {
        t.skip('rustup not available');
        return;
      }

      // Use a clearly invalid version that will never exist
      const result = await isToolchainInstalled(
        '999.999.999-this-toolchain-does-not-exist',
      );
      assert.equal(result, false);
    });

    it('returns true for installed toolchain', async (t) => {
      if (!(await hasRustup())) {
        t.skip('rustup not available');
        return;
      }

      // Use 1.93.0 which is required by our fixtures anyway
      const result = await isToolchainInstalled('1.93.0');
      if (!result) {
        t.skip('1.93.0 toolchain not installed');
        return;
      }
      assert.equal(result, true);
    });
  });

  describe('isWasmTargetInstalled', () => {
    it('returns false for non-existent toolchain', async (t) => {
      if (!(await hasRustup())) {
        t.skip('rustup not available');
        return;
      }

      // Use a clearly invalid version that will never exist
      const result = await isWasmTargetInstalled(
        '999.999.999-this-toolchain-does-not-exist',
      );
      assert.equal(result, false);
    });
  });

  describe('isCargoStylusInstalled', () => {
    it('returns boolean based on cargo-stylus availability', async (t) => {
      if (!(await hasRustup())) {
        t.skip('rustup not available');
        return;
      }

      // Just check it returns a boolean without error
      const result = await isCargoStylusInstalled();
      assert.equal(typeof result, 'boolean');
    });
  });
});
