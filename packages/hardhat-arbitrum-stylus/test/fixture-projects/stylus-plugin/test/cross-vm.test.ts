import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Cross-VM: Solidity + Stylus', async function () {
  const { stylusViem } = await network.connect();

  it('deploys both VMs and interacts on the same chain', async function () {
    // Deploy Solidity counter (stylusViem handles both)
    const solCounter = await stylusViem.deployContract('SolidityCounter');

    // Deploy Stylus counter — same API!
    const stylusCounter = await stylusViem.deployContract('stylus-counter');

    // Both start at 0
    assert.equal(await solCounter.read.count(), 0n);
    assert.equal(await stylusCounter.read.count(), 0n);

    // Increment both
    await solCounter.write.increment();
    await stylusCounter.write.increment();

    // Both should be 1
    assert.equal(await solCounter.read.count(), 1n);
    assert.equal(await stylusCounter.read.count(), 1n);

    // Solidity-specific operations still work
    await solCounter.write.setCount([100n]);
    assert.equal(await solCounter.read.count(), 100n);

    // Stylus counter is independent
    assert.equal(await stylusCounter.read.count(), 1n);
  });
});
