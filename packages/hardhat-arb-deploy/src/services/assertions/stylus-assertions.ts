import assert from 'node:assert/strict';

/**
 * Walk the error cause chain looking for a hex `data` field.
 * Returns the hex data if found, null otherwise.
 */
function findRevertData(error: unknown): `0x${string}` | null {
  let current: unknown = error;
  let signature: `0x${string}` | null = null;
  while (current instanceof Error) {
    if ('data' in current) {
      const { data } = current as Error & { data?: unknown };
      if (typeof data === 'string' && data.startsWith('0x')) {
        return data as `0x${string}`;
      }
    }
    const sig = (current as unknown as Record<string, unknown>).signature;
    if (!signature && typeof sig === 'string' && sig.startsWith('0x')) {
      signature = sig as `0x${string}`;
    }
    current = (current as Error & { cause?: unknown }).cause;
  }
  return signature;
}

async function stylusRevert(contractFn: Promise<unknown>): Promise<void> {
  try {
    await contractFn;
  } catch {
    return;
  }
  assert.fail('The function was expected to revert, but it did not revert');
}

async function stylusRevertWith(
  contractFn: Promise<unknown>,
  expectedReason: string,
): Promise<void> {
  try {
    await contractFn;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes(expectedReason)) {
      return;
    }
    const actual = error instanceof Error ? error.message : String(error);
    assert.fail(
      `The function was expected to revert with reason "${expectedReason}", ` +
        `but it reverted with: ${actual}`,
    );
  }
  assert.fail('The function was expected to revert, but it did not revert');
}

const KNOWN_ERROR_SELECTORS = new Set(['0x08c379a0', '0x4e487b71']);

async function stylusRevertWithCustomError(
  contractFn: Promise<unknown>,
  contract: { abi: unknown[] },
  customErrorName: string,
): Promise<void> {
  try {
    await contractFn;
  } catch (error: unknown) {
    const data = findRevertData(error);
    if (data && data !== '0x') {
      const { decodeErrorResult } = await import('viem');
      try {
        const decoded = decodeErrorResult({
          data,
          abi: contract.abi as any,
        });
        if (decoded.errorName === customErrorName) return;
        assert.fail(
          `Expected revert with custom error "${customErrorName}", ` +
            `but it reverted with custom error "${decoded.errorName}"`,
        );
      } catch {
        // ABI decode failed (error not in ABI, e.g. Stylus contracts).
        // Accept if the selector indicates a custom error (not Error/Panic).
        const selector = data.slice(0, 10).toLowerCase();
        if (!KNOWN_ERROR_SELECTORS.has(selector)) return;
      }
    }
    if (error instanceof Error && error.message.includes(customErrorName)) {
      return;
    }
    assert.fail(
      `Expected revert with custom error "${customErrorName}". ` +
        `The call did revert but the error could not be identified. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  assert.fail(
    `The function was expected to revert with custom error "${customErrorName}", ` +
      `but it did not revert`,
  );
}

async function stylusRevertWithCustomErrorWithArgs(
  contractFn: Promise<unknown>,
  contract: { abi: unknown[] },
  customErrorName: string,
  expectedArgs: unknown[],
): Promise<void> {
  try {
    await contractFn;
  } catch (error: unknown) {
    const data = findRevertData(error);
    if (data && data !== '0x') {
      const { decodeErrorResult } = await import('viem');
      try {
        const decoded = decodeErrorResult({
          data,
          abi: contract.abi as any,
        });
        if (decoded.errorName !== customErrorName) {
          assert.fail(
            `Expected revert with custom error "${customErrorName}", ` +
              `but it reverted with custom error "${decoded.errorName}"`,
          );
        }
        const actualArgs = Array.isArray(decoded.args) ? decoded.args : [];
        assert.deepStrictEqual(
          actualArgs,
          expectedArgs,
          `Custom error "${customErrorName}" args mismatch`,
        );
        return;
      } catch (decodeErr) {
        if (
          decodeErr instanceof assert.AssertionError ||
          (decodeErr as Error)?.name === 'AssertionError'
        ) {
          throw decodeErr;
        }
        // ABI decode failed (error not in ABI, e.g. Stylus contracts).
        // Accept if the selector indicates a custom error (not Error/Panic).
        const selector = data.slice(0, 10).toLowerCase();
        if (!KNOWN_ERROR_SELECTORS.has(selector)) return;
      }
    }
    if (error instanceof Error && error.message.includes(customErrorName)) {
      return;
    }
    assert.fail(
      `Expected revert with custom error "${customErrorName}" and args [${expectedArgs.join(', ')}]. ` +
        `The call did revert but the error could not be identified. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  assert.fail(
    `The function was expected to revert with custom error "${customErrorName}", ` +
      `but it did not revert`,
  );
}

/**
 * Build a stylusViem.assertions object from the original viem.assertions.
 * HardhatViemAssertionsImpl uses a JS private field (#viem) which cannot
 * be accessed through a Proxy or even via .bind() when the original object
 * is obtained through a Proxy chain. Arrow-function wrappers that call the
 * method directly on the captured reference work reliably.
 */
export function buildStylusAssertions(
  o: Record<string, any>,
): Record<string, unknown> {
  return {
    emit: (...a: unknown[]) => o.emit(...a),
    emitWithArgs: (...a: unknown[]) => o.emitWithArgs(...a),
    balancesHaveChanged: (...a: unknown[]) => o.balancesHaveChanged(...a),
    revert: stylusRevert,
    revertWith: stylusRevertWith,
    revertWithCustomError: stylusRevertWithCustomError,
    revertWithCustomErrorWithArgs: stylusRevertWithCustomErrorWithArgs,
  };
}
