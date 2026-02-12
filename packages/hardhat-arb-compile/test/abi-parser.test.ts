import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { parseAbiFromSolidity } from '../src/utils/abi/export.js';

describe('parseAbiFromSolidity', () => {
  it('returns empty array for empty string', () => {
    assert.deepStrictEqual(parseAbiFromSolidity(''), []);
  });

  it('returns empty array for whitespace-only string', () => {
    assert.deepStrictEqual(parseAbiFromSolidity('   \n  '), []);
  });

  it('parses a single view function', () => {
    const iface = `interface ICounter {
      function count() external view returns (uint256);
    }`;

    const abi = parseAbiFromSolidity(iface);
    assert.strictEqual(abi.length, 1);

    const entry = abi[0] as {
      type: string;
      name: string;
      inputs: unknown[];
      outputs: { name: string; type: string }[];
      stateMutability: string;
    };
    assert.strictEqual(entry.type, 'function');
    assert.strictEqual(entry.name, 'count');
    assert.strictEqual(entry.stateMutability, 'view');
    assert.strictEqual(entry.inputs.length, 0);
    assert.strictEqual(entry.outputs.length, 1);
    assert.strictEqual(entry.outputs[0].type, 'uint256');
  });

  it('parses multiple functions', () => {
    const iface = `interface ICounter {
      function count() external view returns (uint256);
      function increment() external;
    }`;

    const abi = parseAbiFromSolidity(iface);
    assert.strictEqual(abi.length, 2);

    const names = abi.map((e: unknown) => (e as { name: string }).name);
    assert.ok(names.includes('count'));
    assert.ok(names.includes('increment'));
  });

  it('parses event definitions with indexed params', () => {
    const iface = `interface IToken {
      event Transfer(address indexed from, address indexed to, uint256 value);
    }`;

    const abi = parseAbiFromSolidity(iface);
    assert.strictEqual(abi.length, 1);

    const event = abi[0] as {
      type: string;
      name: string;
      inputs: { name: string; type: string; indexed: boolean }[];
      anonymous: boolean;
    };
    assert.strictEqual(event.type, 'event');
    assert.strictEqual(event.name, 'Transfer');
    assert.strictEqual(event.anonymous, false);
    assert.strictEqual(event.inputs.length, 3);
    assert.strictEqual(event.inputs[0].indexed, true);
    assert.strictEqual(event.inputs[1].indexed, true);
    assert.strictEqual(event.inputs[2].indexed, false);
  });

  it('normalizes uint to uint256 and int to int256', () => {
    const iface = `interface INorm {
      function get() external view returns (uint);
      function set(int val) external;
    }`;

    const abi = parseAbiFromSolidity(iface);
    assert.strictEqual(abi.length, 2);

    const get = abi[0] as {
      outputs: { type: string }[];
    };
    assert.strictEqual(get.outputs[0].type, 'uint256');

    const set = abi[1] as {
      inputs: { type: string }[];
    };
    assert.strictEqual(set.inputs[0].type, 'int256');
  });
});
