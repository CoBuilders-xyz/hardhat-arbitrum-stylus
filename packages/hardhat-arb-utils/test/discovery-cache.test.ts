import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import {
  discoverStylusContracts,
  clearDiscoveryCache,
} from '../src/stylus/discovery/index.js';

async function writeStylusContract(
  contractsDir: string,
  name: string,
  toolchain: string,
): Promise<void> {
  const contractDir = path.join(contractsDir, name);
  await fs.mkdir(contractDir, { recursive: true });

  const cargo = [
    '[package]',
    `name = "${name}"`,
    'version = "0.1.0"',
    '',
    '[dependencies]',
    'stylus-sdk = "0.6.0"',
    '',
  ].join('\n');

  const rustToolchain = ['[toolchain]', `channel = "${toolchain}"`, ''].join(
    '\n',
  );

  await fs.writeFile(path.join(contractDir, 'Cargo.toml'), cargo, 'utf-8');
  await fs.writeFile(
    path.join(contractDir, 'rust-toolchain.toml'),
    rustToolchain,
    'utf-8',
  );
}

describe('Stylus discovery cache', () => {
  let tmpDir: string;
  let contractsDir: string;

  beforeEach(async () => {
    clearDiscoveryCache();
    tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'stylus-discovery-cache-'),
    );
    contractsDir = path.join(tmpDir, 'contracts');
    await fs.mkdir(contractsDir, { recursive: true });
  });

  afterEach(async () => {
    clearDiscoveryCache();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('reuses cached results until forceRefresh is requested', async () => {
    await writeStylusContract(contractsDir, 'stylus-one', '1.82.0');

    const first = await discoverStylusContracts(contractsDir);
    assert.equal(first.length, 1);
    assert.equal(first[0].name, 'stylus-one');

    await writeStylusContract(contractsDir, 'stylus-two', '1.83.0');

    const cached = await discoverStylusContracts(contractsDir);
    assert.equal(cached.length, 1);
    assert.equal(cached[0].name, 'stylus-one');

    const refreshed = await discoverStylusContracts(contractsDir, {
      forceRefresh: true,
    });
    const names = refreshed.map((contract) => contract.name).sort();
    assert.deepEqual(names, ['stylus-one', 'stylus-two']);
  });

  it('uses filter-aware cache keys and returns defensive copies', async () => {
    await writeStylusContract(contractsDir, 'stylus-one', '1.82.0');
    await writeStylusContract(contractsDir, 'stylus-two', '1.83.0');

    const one = await discoverStylusContracts(contractsDir, {
      contracts: ['stylus-one'],
    });
    assert.equal(one.length, 1);
    assert.equal(one[0].name, 'stylus-one');

    // Mutate the returned array to verify cache data is not exposed directly.
    one.push({ name: 'mutated', path: '/tmp', toolchain: '1.0.0' });

    const oneAgain = await discoverStylusContracts(contractsDir, {
      contracts: ['stylus-one'],
    });
    assert.equal(oneAgain.length, 1);
    assert.equal(oneAgain[0].name, 'stylus-one');

    const two = await discoverStylusContracts(contractsDir, {
      contracts: ['stylus-two'],
    });
    assert.equal(two.length, 1);
    assert.equal(two[0].name, 'stylus-two');

    const allA = await discoverStylusContracts(contractsDir, {
      contracts: ['stylus-two', 'stylus-one'],
    });
    const allB = await discoverStylusContracts(contractsDir, {
      contracts: ['stylus-one', 'stylus-two'],
    });
    assert.equal(allA.length, 2);
    assert.equal(allB.length, 2);
  });
});
