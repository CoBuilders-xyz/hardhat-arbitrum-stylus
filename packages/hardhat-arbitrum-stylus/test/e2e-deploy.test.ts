/**
 * E2E tests that verify deploying and interacting with contracts.
 * - Solidity uses the original `viem` helpers from hardhat-viem.
 * - Stylus uses `stylusViem` which handles both Solidity + Stylus contracts.
 *
 * Requirements: Docker (for nitro-devnode), cargo-stylus (for Stylus tests).
 */
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { DockerClient } from '@cobuilders/hardhat-arb-utils';
import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { setTestHostMode } from '@cobuilders/hardhat-arb-deploy';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

async function hasDocker(): Promise<boolean> {
  try {
    return new DockerClient().isAvailable();
  } catch {
    return false;
  }
}

function hasCargoStylus(): boolean {
  try {
    execSync('cargo stylus --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function loadHre(): Promise<any> {
  const config = await import(
    pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
  );
  return createHardhatRuntimeEnvironment(config.default);
}

// --- Solidity Only (uses original viem) ---

describe('E2E: Solidity-only deploy', () => {
  useFixtureProject('stylus-plugin');

  it(
    'deploys SolidityCounter and GreeterSol via viem',
    { timeout: 120_000 },
    async (t) => {
      if (!(await hasDocker())) {
        t.skip('Docker not available');
        return;
      }

      const hre = await loadHre();
      await hre.tasks.getTask('compile').run({ quiet: true });
      const connection = await hre.network.connect();

      try {
        const viem = (connection as any).viem;

        // SolidityCounter
        const counter = await viem.deployContract('SolidityCounter');
        assert.ok(counter.address, 'Counter should have an address');
        assert.equal(await counter.read.count(), 0n);

        await counter.write.increment();
        assert.equal(await counter.read.count(), 1n);

        await counter.write.setCount([42n]);
        assert.equal(await counter.read.count(), 42n);

        // GreeterSol with constructor args
        const greeter = await viem.deployContract('GreeterSol', [
          'Hello Arbitrum!',
        ]);
        assert.ok(greeter.address, 'Greeter should have an address');
        assert.equal(await greeter.read.greet(), 'Hello Arbitrum!');

        await greeter.write.setGreeting(['Goodbye!']);
        assert.equal(await greeter.read.greet(), 'Goodbye!');
      } finally {
        await connection.close();
      }
    },
  );
});

// --- Stylus Only (uses stylusViem) ---

describe('E2E: Stylus-only deploy', () => {
  useFixtureProject('stylus-plugin');

  it(
    'deploys stylus-counter via stylusViem',
    { timeout: 300_000 },
    async (t) => {
      if (!(await hasDocker())) {
        t.skip('Docker not available');
        return;
      }
      if (!hasCargoStylus()) {
        t.skip('cargo-stylus not installed');
        return;
      }

      setTestHostMode(true);

      try {
        const hre = await loadHre();
        const connection = await hre.network.connect();

        try {
          const { stylusViem } = connection;

          // stylus-counter (no compile step — cargo stylus deploy handles it)
          const counter = await stylusViem.deployContract('stylus-counter');
          assert.ok(counter.address, 'Stylus counter should have an address');
          assert.equal(await counter.read.count(), 0n);

          await counter.write.increment();
          assert.equal(await counter.read.count(), 1n);
        } finally {
          await connection.close();
        }
      } finally {
        setTestHostMode(null);
      }
    },
  );
});

// --- Cross-VM: Solidity + Stylus (uses stylusViem for both) ---

describe('E2E: Cross-VM deploy (Solidity + Stylus)', () => {
  useFixtureProject('stylus-plugin');

  it(
    'deploys both Solidity and Stylus counters via stylusViem',
    { timeout: 300_000 },
    async (t) => {
      if (!(await hasDocker())) {
        t.skip('Docker not available');
        return;
      }
      if (!hasCargoStylus()) {
        t.skip('cargo-stylus not installed');
        return;
      }

      setTestHostMode(true);

      try {
        const hre = await loadHre();
        await hre.tasks.getTask('compile').run({ quiet: true });
        const connection = await hre.network.connect();

        try {
          // stylusViem handles both Solidity and Stylus — unified API
          const { stylusViem } = connection;

          // Deploy Solidity counter
          const solCounter = await stylusViem.deployContract('SolidityCounter');
          assert.ok(solCounter.address, 'Solidity counter should deploy');

          // Deploy Stylus counter — same API!
          const stylusCounter =
            await stylusViem.deployContract('stylus-counter');
          assert.ok(stylusCounter.address, 'Stylus counter should deploy');

          // Both start at 0
          assert.equal(await solCounter.read.count(), 0n);
          assert.equal(await stylusCounter.read.count(), 0n);

          // Increment both
          await solCounter.write.increment();
          await stylusCounter.write.increment();

          // Both should be 1
          assert.equal(await solCounter.read.count(), 1n);
          assert.equal(await stylusCounter.read.count(), 1n);

          // Solidity-specific: setCount
          await solCounter.write.setCount([100n]);
          assert.equal(await solCounter.read.count(), 100n);

          // Stylus counter is independent
          assert.equal(await stylusCounter.read.count(), 1n);
        } finally {
          await connection.close();
        }
      } finally {
        setTestHostMode(null);
      }
    },
  );
});
