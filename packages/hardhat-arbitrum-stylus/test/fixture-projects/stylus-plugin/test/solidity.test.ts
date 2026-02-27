import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Solidity Contracts', async function () {
  const { stylusViem } = await network.connect();

  it('SolidityCounter: deploys and counts', async function () {
    const counter = await stylusViem.deployContract('SolidityCounter');
    assert.equal(await counter.read.count(), 0n);

    await counter.write.increment();
    assert.equal(await counter.read.count(), 1n);

    await counter.write.setCount([42n]);
    assert.equal(await counter.read.count(), 42n);
  });

  it('GreeterSol: deploys with constructor args', async function () {
    const greeter = await stylusViem.deployContract('GreeterSol', [
      'Hello Arbitrum!',
    ]);
    assert.equal(await greeter.read.greet(), 'Hello Arbitrum!');

    await greeter.write.setGreeting(['Goodbye!']);
    assert.equal(await greeter.read.greet(), 'Goodbye!');
  });
});
