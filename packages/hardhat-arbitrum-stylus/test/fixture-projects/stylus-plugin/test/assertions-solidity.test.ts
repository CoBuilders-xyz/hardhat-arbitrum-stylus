import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Solidity Assertions', async function () {
  const { stylusViem } = await network.connect();
  const counter = await stylusViem.deployContract('SolidityCounter');
  const greeter = await stylusViem.deployContract('GreeterSol', [
    'Hello Stylus!',
  ]);
  const assertCounter = await stylusViem.deployContract('SolidityCounter');

  describe('SolidityCounter', function () {
    it('initial count is zero (equal)', async function () {
      assert.equal(await counter.read.count(), 0n);
    });

    it('increment changes value (notEqual)', async function () {
      const before = await counter.read.count();
      await counter.write.increment();
      const after = await counter.read.count();
      assert.notEqual(before, after);
    });

    it('setCount sets exact value (strictEqual)', async function () {
      await counter.write.setCount([99n]);
      assert.strictEqual(await counter.read.count(), 99n);
    });

    it('contract address is valid hex (ok + match)', async function () {
      assert.ok(counter.address, 'address should be truthy');
      assert.match(counter.address, /^0x[0-9a-fA-F]{40}$/);
    });

    it('count returns bigint type (typeof)', async function () {
      const val = await counter.read.count();
      assert.ok(typeof val === 'bigint', 'count should return bigint');
    });

    it('decrement below zero reverts (rejects)', async function () {
      await counter.write.setCount([0n]);
      assert.equal(await counter.read.count(), 0n);
      await assert.rejects(async () => {
        await counter.write.decrement();
      });
    });

    it('increment does not reject (doesNotReject)', async function () {
      await assert.doesNotReject(async () => {
        await counter.write.increment();
      });
    });

    it('emits CountChanged event (deepStrictEqual)', async function () {
      await counter.write.setCount([0n]);
      await counter.write.increment();
      const events = await counter.getEvents.CountChanged();
      assert.ok(events.length > 0, 'should have emitted CountChanged');
      const last = events[events.length - 1];
      assert.deepStrictEqual(last.args.newCount, 1n);
    });
  });

  describe('GreeterSol', function () {
    it('constructor sets greeting (equal)', async function () {
      assert.equal(await greeter.read.greet(), 'Hello Stylus!');
    });

    it('greeting matches pattern (match)', async function () {
      const greeting = await greeter.read.greet();
      assert.match(greeting, /^Hello/);
    });

    it('setGreeting updates value (notEqual)', async function () {
      await greeter.write.setGreeting(['Goodbye!']);
      assert.notEqual(await greeter.read.greet(), 'Hello Stylus!');
      assert.equal(await greeter.read.greet(), 'Goodbye!');
    });

    it('emits GreetingChanged event', async function () {
      await greeter.write.setGreeting(['Changed!']);
      const events = await greeter.getEvents.GreetingChanged();
      assert.ok(events.length > 0);
      const last = events[events.length - 1];
      assert.equal(last.args.newGreeting, 'Changed!');
    });

    it('greet returns string type', async function () {
      const val = await greeter.read.greet();
      assert.ok(typeof val === 'string', 'greet should return string');
    });
  });

  describe('stylusViem.assertions on Solidity', function () {
    it('emit assertion on increment', async function () {
      await stylusViem.assertions.emit(
        assertCounter.write.increment(),
        assertCounter,
        'CountChanged',
      );
    });

    it('emitWithArgs assertion on setCount', async function () {
      await stylusViem.assertions.emitWithArgs(
        assertCounter.write.setCount([42n]),
        assertCounter,
        'CountChanged',
        [42n],
      );
    });

    it('balancesHaveChanged assertion on ETH transfer', async function () {
      const [sender] = await stylusViem.getWalletClients();
      const recipient =
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as `0x${string}`;

      await stylusViem.assertions.balancesHaveChanged(
        sender.sendTransaction({
          to: recipient,
          value: 1000n,
        }),
        [{ address: recipient, amount: 1000n }],
      );
    });

    it('revert assertion on decrement at zero', async function () {
      await assertCounter.write.setCount([0n]);
      await stylusViem.assertions.revert(assertCounter.write.decrement());
    });

    it('revertWith assertion on decrement at zero', async function () {
      await assertCounter.write.setCount([0n]);
      await stylusViem.assertions.revertWith(
        assertCounter.write.decrement(),
        'Counter: cannot decrement below zero',
      );
    });

    it('revertWithCustomError assertion on decrementCustom', async function () {
      await assertCounter.write.setCount([0n]);
      await stylusViem.assertions.revertWithCustomError(
        assertCounter.write.decrementCustom(),
        assertCounter,
        'Underflow',
      );
    });

    it('revertWithCustomErrorWithArgs assertion on setCountChecked', async function () {
      await assertCounter.write.setCount([5n]);
      await stylusViem.assertions.revertWithCustomErrorWithArgs(
        assertCounter.write.setCountChecked([2000n]),
        assertCounter,
        'InvalidCount',
        [5n, 2000n],
      );
    });
  });
});
