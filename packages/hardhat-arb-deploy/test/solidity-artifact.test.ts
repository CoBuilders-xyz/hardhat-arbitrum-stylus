import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';

import { findSolidityArtifact } from '../src/utils/deployer/solidity.js';

describe('findSolidityArtifact', () => {
  useFixtureProject('deploy-default');

  it('finds an artifact by contract name', () => {
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    const result = findSolidityArtifact(artifactsDir, 'SolidityCounter');

    assert.ok(result, 'Should find the artifact');
    assert.strictEqual(result.contractName, 'SolidityCounter');
    assert.ok(result.bytecode.startsWith('0x'), 'Bytecode should be hex');
    assert.ok(result.abi.length > 0, 'ABI should have entries');
  });

  it('returns null for nonexistent contract name', () => {
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    const result = findSolidityArtifact(artifactsDir, 'DoesNotExist');

    assert.strictEqual(result, null);
  });

  it('returns null for nonexistent artifacts directory', () => {
    const result = findSolidityArtifact('/tmp/no-such-dir', 'SolidityCounter');
    assert.strictEqual(result, null);
  });

  it('skips .dbg. files', () => {
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    // The .dbg.json file exists but should not be picked up
    const result = findSolidityArtifact(artifactsDir, 'SolidityCounter');

    assert.ok(result, 'Should still find the real artifact');
    assert.strictEqual(result.contractName, 'SolidityCounter');
  });
});
