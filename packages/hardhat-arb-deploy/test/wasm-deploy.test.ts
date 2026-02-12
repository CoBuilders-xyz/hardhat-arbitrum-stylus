import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseDeployedAddress } from '../src/utils/deployer/wasm-host.js';

describe('WASM Deploy', () => {
  describe('parseDeployedAddress', () => {
    it('parses "deployed code at address:" format', () => {
      const output =
        'deployed code at address: 0x1234567890abcdef1234567890abcdef12345678';
      const address = parseDeployedAddress(output);
      assert.equal(address, '0x1234567890abcdef1234567890abcdef12345678');
    });

    it('parses "contract deployed at" format', () => {
      const output =
        'contract deployed at 0xabcdef1234567890abcdef1234567890abcdef12';
      const address = parseDeployedAddress(output);
      assert.equal(address, '0xabcdef1234567890abcdef1234567890abcdef12');
    });

    it('parses "deployed at:" format', () => {
      const output = 'deployed at: 0x9876543210fedcba9876543210fedcba98765432';
      const address = parseDeployedAddress(output);
      assert.equal(address, '0x9876543210fedcba9876543210fedcba98765432');
    });

    it('parses address from multiline output', () => {
      const output = [
        'Compiling contract...',
        'Sending deployment transaction...',
        'deployed code at address: 0xAABBCCDDEEFF00112233445566778899AABBCCDD',
        'Done.',
      ].join('\n');
      const address = parseDeployedAddress(output);
      assert.equal(address, '0xAABBCCDDEEFF00112233445566778899AABBCCDD');
    });

    it('falls back to first 0x address in output', () => {
      const output =
        'Some output with 0xDeadBeefDeadBeefDeadBeefDeadBeefDeadBeef address';
      const address = parseDeployedAddress(output);
      assert.equal(address, '0xDeadBeefDeadBeefDeadBeefDeadBeefDeadBeef');
    });

    it('returns null when no address found', () => {
      const output = 'No address here';
      const address = parseDeployedAddress(output);
      assert.equal(address, null);
    });

    it('returns null for empty output', () => {
      const address = parseDeployedAddress('');
      assert.equal(address, null);
    });

    it('handles mixed case addresses', () => {
      const output =
        'deployed code at address: 0xaAbBcCdDeEfF0011223344556677889900AaBbCc';
      const address = parseDeployedAddress(output);
      assert.equal(address, '0xaAbBcCdDeEfF0011223344556677889900AaBbCc');
    });
  });
});
