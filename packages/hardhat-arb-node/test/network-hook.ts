import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';

import { useFixtureProject } from '@cobuilders/hardhat-arb-utils/testing';
import { createHardhatRuntimeEnvironment } from 'hardhat/hre';

describe('Arb-node default network', () => {
  useFixtureProject('node-plugin');

  it('should connect to arb-node on default network', async () => {
    const hardhatConfig = await import(
      pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
    );
    const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);
    const connection = await hre.network.connect();


    // Verify we're connected to the right chain (Arbitrum nitro-devnode chainId: 412346)
    const chainId = await connection.provider.request({
      method: 'eth_chainId',
    });
    assert.equal(chainId, '0x64aba'); // 412346 in hex
  });

  it('should have pre-funded accounts available', async () => {
    const hardhatConfig = await import(
      pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
    );
    const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);
    const connection = await hre.network.connect();

    // Get accounts
    const accounts = await connection.provider.request({
      method: 'eth_accounts',
    });

    // Should have the 20 Hardhat accounts configured
    assert.equal(accounts.length, 20);

    // First account should be the well-known Hardhat account #0
    assert.equal(
      accounts[0].toLowerCase(),
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    );
  });

  it('should be able to get account balance', async () => {
    const hardhatConfig = await import(
      pathToFileURL(path.join(process.cwd(), 'hardhat.config.js')).href
    );
    const hre = await createHardhatRuntimeEnvironment(hardhatConfig.default);
    const connection = await hre.network.connect();

    // Get balance of first account
    const balance = await connection.provider.request({
      method: 'eth_getBalance',
      params: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'latest'],
    });

    // Should have ETH (pre-funded with 10 ETH)
    const balanceBigInt = BigInt(balance);
    assert.ok(balanceBigInt > 0n, 'Account should have balance');
  });
});
