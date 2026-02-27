import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Stylus Contracts', async function () {
  const { stylusViem } = await network.connect();

  it('stylus-counter: deploys and counts', async function () {
    const counter = await stylusViem.deployContract('stylus-counter');
    assert.equal(await counter.read.count(), 0n);

    await counter.write.increment();
    assert.equal(await counter.read.count(), 1n);
  });
});
