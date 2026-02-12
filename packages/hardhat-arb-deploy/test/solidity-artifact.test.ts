import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findSolidityArtifact } from '../src/utils/deployer/solidity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ARTIFACTS = path.join(
  __dirname,
  'fixture-projects',
  'deploy-default',
  'artifacts',
);

describe('findSolidityArtifact', () => {
  it('finds an artifact by contract name', () => {
    const result = findSolidityArtifact(FIXTURE_ARTIFACTS, 'SolidityCounter');

    assert.ok(result, 'Should find the artifact');
    assert.strictEqual(result.contractName, 'SolidityCounter');
    assert.ok(result.bytecode.startsWith('0x'), 'Bytecode should be hex');
    assert.ok(result.abi.length > 0, 'ABI should have entries');
  });

  it('returns null for nonexistent contract name', () => {
    const result = findSolidityArtifact(FIXTURE_ARTIFACTS, 'DoesNotExist');

    assert.strictEqual(result, null);
  });

  it('returns null for nonexistent artifacts directory', () => {
    const result = findSolidityArtifact('/tmp/no-such-dir', 'SolidityCounter');
    assert.strictEqual(result, null);
  });

  it('skips .dbg. files', () => {
    // The .dbg.json file exists but should not be picked up
    const result = findSolidityArtifact(FIXTURE_ARTIFACTS, 'SolidityCounter');

    assert.ok(result, 'Should still find the real artifact');
    assert.strictEqual(result.contractName, 'SolidityCounter');
  });
});
