/**
 * Test-time deployment configuration via environment variable.
 * Uses process.env so the value propagates to worker threads and child processes
 * spawned by the Node.js test runner.
 */

const ENV_KEY = 'HARDHAT_ARB_TEST_HOST_MODE';

/**
 * Override the host/container mode for Stylus deployments during tests.
 * Pass null to reset to config default.
 */
export function setTestHostMode(host: boolean | null): void {
  if (host === null) {
    delete process.env[ENV_KEY];
  } else {
    process.env[ENV_KEY] = host ? '1' : '0';
  }
}

/**
 * Get the current test-time host mode override.
 * Returns null if no override is set (use config default).
 */
export function getTestHostMode(): boolean | null {
  const value = process.env[ENV_KEY];
  if (value === undefined) return null;
  return value === '1';
}
