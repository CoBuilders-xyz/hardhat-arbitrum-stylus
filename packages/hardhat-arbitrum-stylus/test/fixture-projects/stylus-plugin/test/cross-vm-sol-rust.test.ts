import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { network } from 'hardhat';

describe('Cross-VM: EOA > Solidity > Stylus', async function () {
  const { stylusViem } = await network.connect();
  const [walletClient] = await stylusViem.getWalletClients();
  const eoa = walletClient.account.address;

  const stylusCounter = await stylusViem.deployContract('stylus-counter');
  const solProxy = await stylusViem.deployContract('SolidityProxy', [
    stylusCounter.address,
  ]);

  it('Solidity Proxy owner is the EOA', async function () {
    const owner = await solProxy.read.owner();
    assert.equal(owner.toLowerCase(), eoa.toLowerCase());
  });

  it('Solidity Proxy target is the Stylus counter', async function () {
    const target = await solProxy.read.target();
    assert.equal(target.toLowerCase(), stylusCounter.address.toLowerCase());
  });

  it('proxyCount reads Stylus counter (starts at 0)', async function () {
    assert.equal(await solProxy.read.proxyCount(), 0n);
  });

  it('proxyIncrement writes through to Stylus counter', async function () {
    await solProxy.write.proxyIncrement();
    assert.equal(await solProxy.read.proxyCount(), 1n);
    assert.equal(await stylusCounter.read.count(), 1n);
  });

  it('multiple increments through proxy accumulate', async function () {
    await solProxy.write.proxyIncrement();
    await solProxy.write.proxyIncrement();
    assert.equal(await solProxy.read.proxyCount(), 3n);
    assert.equal(await stylusCounter.read.count(), 3n);
  });

  it('direct Stylus counter read matches proxy read', async function () {
    const direct = await stylusCounter.read.count();
    const proxied = await solProxy.read.proxyCount();
    assert.equal(direct, proxied);
  });
});
