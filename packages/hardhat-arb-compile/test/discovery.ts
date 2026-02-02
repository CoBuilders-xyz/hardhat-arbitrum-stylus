import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';

import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';

import { discoverStylusContracts } from '../src/utils/index.js';

describe('Contract Discovery', () => {
  describe('discoverStylusContracts', () => {
    useFixtureProject('compile-discovery');

    it('discovers all Stylus contracts in directory', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');
      const contracts = await discoverStylusContracts(contractsDir);

      assert.equal(contracts.length, 2);

      const names = contracts.map((c) => c.name).sort();
      assert.deepEqual(names, ['stylus-counter', 'stylus-hello-world']);
    });

    it('extracts correct toolchain versions', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');
      const contracts = await discoverStylusContracts(contractsDir);

      const helloWorld = contracts.find((c) => c.name === 'stylus-hello-world');
      const counter = contracts.find((c) => c.name === 'stylus-counter');

      assert.equal(helloWorld?.toolchain, '1.93.0');
      assert.equal(counter?.toolchain, '1.82.0');
    });

    it('provides absolute paths to contract directories', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');
      const contracts = await discoverStylusContracts(contractsDir);

      for (const contract of contracts) {
        assert.ok(path.isAbsolute(contract.path));
        assert.ok(contract.path.includes('contracts'));
      }
    });

    it('ignores non-Stylus Cargo.toml projects', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');
      const contracts = await discoverStylusContracts(contractsDir);

      const nonStylus = contracts.find((c) => c.name === 'non-stylus-project');
      assert.equal(nonStylus, undefined);
    });

    it('filters contracts by name', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');
      const contracts = await discoverStylusContracts(contractsDir, {
        contracts: ['stylus-hello-world'],
      });

      assert.equal(contracts.length, 1);
      assert.equal(contracts[0].name, 'stylus-hello-world');
    });

    it('filters multiple contracts by name', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');
      const contracts = await discoverStylusContracts(contractsDir, {
        contracts: ['stylus-hello-world', 'stylus-counter'],
      });

      assert.equal(contracts.length, 2);
    });

    it('returns empty array when filter matches nothing', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');
      const contracts = await discoverStylusContracts(contractsDir, {
        contracts: ['nonexistent'],
      });

      assert.equal(contracts.length, 0);
    });

    it('returns empty array for non-existent directory', async () => {
      const contracts = await discoverStylusContracts('/nonexistent/path');
      assert.equal(contracts.length, 0);
    });

    it('returns empty array for directory with no Stylus contracts', async () => {
      // Create a temp path that exists but has no contracts
      const nonStylusDir = path.join(
        process.cwd(),
        'contracts',
        'non-stylus-project',
      );
      const contracts = await discoverStylusContracts(nonStylusDir);
      // The non-stylus-project has Cargo.toml but no stylus-sdk dependency
      assert.equal(contracts.length, 0);
    });
  });

  describe('missing rust-toolchain.toml', () => {
    useFixtureProject('compile-discovery-missing-toolchain');

    it('throws error when rust-toolchain.toml is missing', async () => {
      const contractsDir = path.join(process.cwd(), 'contracts');

      await assert.rejects(
        () => discoverStylusContracts(contractsDir),
        (error: Error) => {
          assert.ok(error.message.includes('Missing rust-toolchain.toml'));
          return true;
        },
      );
    });
  });
});
