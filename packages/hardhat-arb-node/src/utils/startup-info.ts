import type { Hex } from '@cobuilders/hardhat-arb-utils';

import { HARDHAT_ACCOUNTS } from '../config/defaults.js';

/**
 * Print startup information similar to `npx hardhat node`
 */
export function printStartupInfo(config: {
  httpPort: number;
  wsPort: number;
  chainId: number;
  devAccount: { address: Hex; privateKey: Hex };
}): void {
  console.log(`Started  HTTP Server at http://localhost:${config.httpPort}/
Started WebSocket Server at ws://localhost:${config.wsPort}

Accounts
========

WARNING: Funds sent on live network to accounts with publicly known private keys WILL BE LOST.
`);

  // Print Hardhat's 20 default accounts
  for (let i = 0; i < HARDHAT_ACCOUNTS.length; i++) {
    const account = HARDHAT_ACCOUNTS[i];
    const paddedIndex = i.toString().padStart(2, ' ');
    console.log(`Account #${paddedIndex}: ${account.address} (10 ETH)`);
    console.log(`Private Key: ${account.privateKey}\n`);
  }

  // Print nitro-devnode default account as #20 (chain owner)
  console.log(
    `Account #20: ${config.devAccount.address} (~800 ETH) - Chain Owner`,
  );
  console.log(`Private Key: ${config.devAccount.privateKey}`);
  console.log(`             ↳ L2 chain owner with ArbOwner privileges\n`);

  console.log(
    'WARNING: Funds sent on live network to accounts with publicly known private keys WILL BE LOST.\n',
  );
}
