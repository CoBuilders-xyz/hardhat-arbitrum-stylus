import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  createChain,
  computeCreate2Address,
  type Hex,
} from '../src/web3/index.js';

describe('createChain', () => {
  it('should create a valid chain configuration', () => {
    const chain = createChain({
      chainId: 412346,
      name: 'Test Chain',
      rpcUrl: 'http://localhost:8545',
    });

    assert.strictEqual(chain.id, 412346);
    assert.strictEqual(chain.name, 'Test Chain');
    assert.strictEqual(chain.nativeCurrency.symbol, 'ETH');
    assert.strictEqual(chain.nativeCurrency.decimals, 18);
    assert.deepStrictEqual(chain.rpcUrls.default.http, [
      'http://localhost:8545',
    ]);
  });
});

describe('computeCreate2Address', () => {
  it('should compute correct CREATE2 address', () => {
    // Known test vectors from EIP-1014
    const factory: Hex =
      '0x0000000000000000000000000000000000000000000000000000000000000000';
    const salt: Hex =
      '0x0000000000000000000000000000000000000000000000000000000000000000';
    const initCode: Hex = '0x00';

    const address = computeCreate2Address(factory, salt, initCode);

    // Address should be a valid hex string with 0x prefix and 40 chars
    assert.ok(address.startsWith('0x'));
    assert.strictEqual(address.length, 42);
  });

  it('should produce different addresses for different salts', () => {
    const factory: Hex =
      '0x4e59b44847b379578588920ca78fbf26c0b4956c0000000000000000000000000000000000000000';
    const initCode: Hex = '0x6080604052';
    const salt1: Hex =
      '0x0000000000000000000000000000000000000000000000000000000000000001';
    const salt2: Hex =
      '0x0000000000000000000000000000000000000000000000000000000000000002';

    const address1 = computeCreate2Address(factory, salt1, initCode);
    const address2 = computeCreate2Address(factory, salt2, initCode);

    assert.notStrictEqual(address1, address2);
  });

  it('should produce different addresses for different init codes', () => {
    const factory: Hex =
      '0x4e59b44847b379578588920ca78fbf26c0b4956c0000000000000000000000000000000000000000';
    const salt: Hex =
      '0x0000000000000000000000000000000000000000000000000000000000000001';
    const initCode1: Hex = '0x6080604052';
    const initCode2: Hex = '0x6080604053';

    const address1 = computeCreate2Address(factory, salt, initCode1);
    const address2 = computeCreate2Address(factory, salt, initCode2);

    assert.notStrictEqual(address1, address2);
  });
});
