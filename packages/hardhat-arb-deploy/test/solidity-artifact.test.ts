import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { findSolidityArtifact } from '../src/utils/deployer/solidity.js';

const FAKE_ARTIFACT = {
  contractName: 'SolidityCounter',
  sourceName: 'contracts/SolidityCounter.sol',
  abi: [
    {
      inputs: [],
      name: 'increment',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  bytecode: '0x608060405234801561000f575f80fd5b50',
};

describe('findSolidityArtifact', () => {
  let tmpDir: string;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arb-deploy-test-'));
    const contractDir = path.join(tmpDir, 'contracts', 'SolidityCounter.sol');
    fs.mkdirSync(contractDir, { recursive: true });

    // Write the real artifact
    fs.writeFileSync(
      path.join(contractDir, 'SolidityCounter.json'),
      JSON.stringify(FAKE_ARTIFACT),
    );

    // Write a .dbg. file that should be skipped
    fs.writeFileSync(
      path.join(contractDir, 'SolidityCounter.dbg.json'),
      JSON.stringify({ _format: 'hh-sol-dbg-1', buildInfo: '../../build' }),
    );
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('finds an artifact by contract name', () => {
    const result = findSolidityArtifact(tmpDir, 'SolidityCounter');

    assert.ok(result, 'Should find the artifact');
    assert.strictEqual(result.contractName, 'SolidityCounter');
    assert.ok(result.bytecode.startsWith('0x'), 'Bytecode should be hex');
    assert.ok(result.abi.length > 0, 'ABI should have entries');
  });

  it('returns null for nonexistent contract name', () => {
    const result = findSolidityArtifact(tmpDir, 'DoesNotExist');

    assert.strictEqual(result, null);
  });

  it('returns null for nonexistent artifacts directory', () => {
    const result = findSolidityArtifact('/tmp/no-such-dir', 'SolidityCounter');
    assert.strictEqual(result, null);
  });

  it('skips .dbg. files', () => {
    const result = findSolidityArtifact(tmpDir, 'SolidityCounter');

    assert.ok(result, 'Should still find the real artifact');
    assert.strictEqual(result.contractName, 'SolidityCounter');
  });
});
