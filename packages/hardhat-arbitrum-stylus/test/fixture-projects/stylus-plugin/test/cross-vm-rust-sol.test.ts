import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Cross-VM: EOA > Stylus > Solidity', async function () {
  const { stylusViem } = await network.connect();
  const [walletClient] = await stylusViem.getWalletClients();
  const eoa = walletClient.account.address;

  const solCounter = await stylusViem.deployContract('SolidityCounter');
  const stylusProxy = await stylusViem.deployContract('stylus-proxy', [
    eoa,
    solCounter.address,
  ]);

  it('Stylus proxy owner is the EOA', async function () {
    const owner = await stylusProxy.read.owner();
    assert.equal(owner.toLowerCase(), eoa.toLowerCase());
  });

  it('Stylus proxy target is the Solidity counter', async function () {
    const target = await stylusProxy.read.target();
    assert.equal(target.toLowerCase(), solCounter.address.toLowerCase());
  });

  it('proxyCount reads Solidity counter (starts at 0)', async function () {
    assert.equal(await stylusProxy.read.proxyCount(), 0n);
  });

  it('proxyIncrement writes through to Solidity counter', async function () {
    await stylusProxy.write.proxyIncrement();
    assert.equal(await stylusProxy.read.proxyCount(), 1n);
    assert.equal(await solCounter.read.count(), 1n);
  });

  it('multiple increments through Stylus proxy accumulate', async function () {
    await stylusProxy.write.proxyIncrement();
    await stylusProxy.write.proxyIncrement();
    assert.equal(await stylusProxy.read.proxyCount(), 3n);
    assert.equal(await solCounter.read.count(), 3n);
  });

  it('direct Solidity counter read matches proxy read', async function () {
    const direct = await solCounter.read.count();
    const proxied = await stylusProxy.read.proxyCount();
    assert.equal(direct, proxied);
  });
});
