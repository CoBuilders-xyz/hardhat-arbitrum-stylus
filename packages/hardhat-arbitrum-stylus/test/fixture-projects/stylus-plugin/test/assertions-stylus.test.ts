import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import type { Address } from 'viem';

describe('Stylus Assertions', async function () {
  const { stylusViem } = await network.connect();

  describe('stylus-counter', async function () {
    const counter = await stylusViem.deployContract('stylus-counter');

    it('initial count is zero (equal)', async function () {
      assert.equal(await counter.read.count(), 0n);
    });

    it('increment changes value (notEqual)', async function () {
      const before = await counter.read.count();
      await counter.write.increment();
      const after = await counter.read.count();
      assert.notEqual(before, after);
    });

    it('multiple increments accumulate (strictEqual)', async function () {
      await counter.write.increment();
      await counter.write.increment();
      const val = await counter.read.count();
      assert.strictEqual(val, 3n);
    });

    it('contract address is valid hex (ok + match)', async function () {
      assert.ok(counter.address, 'address should be truthy');
      assert.match(counter.address, /^0x[0-9a-fA-F]{40}$/);
    });

    it('count returns bigint type (typeof)', async function () {
      const val = await counter.read.count();
      assert.ok(typeof val === 'bigint', 'count should return bigint');
    });

    it('increment does not reject (doesNotReject)', async function () {
      await assert.doesNotReject(async () => {
        await counter.write.increment();
      });
    });
  });

  describe('stylus-init-counter', function () {
    it('constructor sets initial value (equal)', async function () {
      const counter = await stylusViem.deployContract('stylus-init-counter', [
        100n,
      ]);
      assert.equal(await counter.read.count(), 100n);
    });

    it('increment from initial value works (strictEqual)', async function () {
      const counter = await stylusViem.deployContract('stylus-init-counter', [
        50n,
      ]);
      await counter.write.increment();
      assert.strictEqual(await counter.read.count(), 51n);
    });

    it('different initial values produce different contracts', async function () {
      const a = await stylusViem.deployContract('stylus-init-counter', [10n]);
      const b = await stylusViem.deployContract('stylus-init-counter', [20n]);
      assert.notEqual(a.address, b.address);
      assert.notEqual(await a.read.count(), await b.read.count());
    });

    it('addresses are distinct (deepStrictEqual on array)', async function () {
      const a = await stylusViem.deployContract('stylus-init-counter', [1n]);
      const b = await stylusViem.deployContract('stylus-init-counter', [2n]);
      const counts = [await a.read.count(), await b.read.count()];
      assert.deepStrictEqual(counts, [1n, 2n]);
    });
  });

  describe('stylusViem.assertions on Stylus', function () {
    const fakeOwner = '0x0000000000000000000000000000000000000001' as Address;

    it('revert assertion on non-owner proxyIncrement', async function () {
      const solCounter = await stylusViem.deployContract('SolidityCounter');
      const proxy = await stylusViem.deployContract('stylus-proxy', [
        fakeOwner,
        solCounter.address,
      ]);
      await stylusViem.assertions.revert(proxy.write.proxyIncrement());
    });

    it('revertWith assertion on non-owner proxyIncrement', async function () {
      const solCounter = await stylusViem.deployContract('SolidityCounter');
      const proxy = await stylusViem.deployContract('stylus-proxy', [
        fakeOwner,
        solCounter.address,
      ]);
      // Stylus custom errors appear as hex signatures in the error message
      await stylusViem.assertions.revertWith(
        proxy.write.proxyIncrement(),
        '0x23295f0e',
      );
    });

    it('revertWithCustomError assertion on Stylus proxy', async function () {
      const solCounter = await stylusViem.deployContract('SolidityCounter');
      const proxy = await stylusViem.deployContract('stylus-proxy', [
        fakeOwner,
        solCounter.address,
      ]);
      await stylusViem.assertions.revertWithCustomError(
        proxy.write.proxyIncrement(),
        proxy,
        'NotOwner',
      );
    });

    it('balancesHaveChanged assertion on ETH transfer', async function () {
      const [sender] = await stylusViem.getWalletClients();
      const recipient =
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as `0x${string}`;

      await stylusViem.assertions.balancesHaveChanged(
        sender.sendTransaction({
          to: recipient,
          value: 5000n,
        }),
        [{ address: recipient, amount: 5000n }],
      );
    });
  });
});
