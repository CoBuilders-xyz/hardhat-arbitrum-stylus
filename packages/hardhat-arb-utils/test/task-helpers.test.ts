import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import { generateNetworkName } from '../src/task-helpers/network-name.js';
import { writeProgress, clearProgress } from '../src/task-helpers/progress.js';

describe('task-helpers', () => {
  describe('generateNetworkName', () => {
    it('should return a string starting with the given prefix', () => {
      const name = generateNetworkName('my-prefix-');
      assert.ok(name.startsWith('my-prefix-'));
    });

    it('should generate unique names on successive calls', () => {
      const a = generateNetworkName('net-');
      const b = generateNetworkName('net-');
      assert.notStrictEqual(a, b);
    });

    it('should append a random suffix after the prefix', () => {
      const prefix = 'test-';
      const name = generateNetworkName(prefix);
      const suffix = name.slice(prefix.length);
      assert.ok(suffix.length > 0, 'Should have a non-empty suffix');
    });
  });

  describe('writeProgress', () => {
    it('writes to stdout', () => {
      const writeSpy = mock.method(process.stdout, 'write', () => true);
      writeProgress('hello');
      assert.ok(writeSpy.mock.calls.length > 0, 'Should call stdout.write');
      const output = String(writeSpy.mock.calls[0].arguments[0]);
      assert.ok(output.includes('hello'), 'Output should contain the message');
      writeSpy.mock.restore();
    });
  });

  describe('clearProgress', () => {
    it('writes whitespace to stdout', () => {
      const writeSpy = mock.method(process.stdout, 'write', () => true);
      clearProgress();
      assert.ok(writeSpy.mock.calls.length > 0, 'Should call stdout.write');
      const output = String(writeSpy.mock.calls[0].arguments[0]);
      assert.ok(output.trim() === '', 'Output should be whitespace');
      writeSpy.mock.restore();
    });
  });
});
