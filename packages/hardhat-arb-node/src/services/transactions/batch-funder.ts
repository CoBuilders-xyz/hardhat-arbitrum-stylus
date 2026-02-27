import {
  type Hex,
  encodeAbiParameters,
  getAddress,
  getTransactionReceipt,
} from '@cobuilders/hardhat-arb-utils';

import { createNodeClient } from './client.js';

/**
 * Pre-compiled creation bytecode for the BatchFunder contract.
 *
 * Source (Solidity 0.8.24, optimizer runs=1):
 *
 *   contract BatchFunder {
 *       constructor(address[] memory recipients, uint256 amountEach) payable {
 *           for (uint256 i = 0; i < recipients.length; i++) {
 *               (bool ok, ) = recipients[i].call{value: amountEach}("");
 *               require(ok);
 *           }
 *           selfdestruct(payable(msg.sender));
 *       }
 *   }
 *
 * On devnodes, selfdestruct in the creation tx still fully works (EIP-6780).
 */
const BATCH_FUNDER_BYTECODE: Hex =
  '0x60806040526040516101b93803806101b9833981016040819052610022916100dd565b5f5b82518110156100aa575f838281518110610040576100406101a4565b60200260200101516001600160a01b0316836040515f6040518083038185875af1925050503d805f811461008f576040519150601f19603f3d011682016040523d82523d5f602084013e610094565b606091505b50509050806100a1575f80fd5b50600101610024565b5033ff5b634e487b7160e01b5f52604160045260245ffd5b80516001600160a01b03811681146100d8575f80fd5b919050565b5f80604083850312156100ee575f80fd5b82516001600160401b0380821115610104575f80fd5b818501915085601f830112610117575f80fd5b815160208282111561012b5761012b6100ae565b8160051b604051601f19603f83011681018181108682111715610150576101506100ae565b60405292835281830193508481018201928984111561016d575f80fd5b948201945b8386101561019257610183866100c2565b85529482019493820193610172565b97909101519698969750505050505050565b634e487b7160e01b5f52603260045260245ffdfe';

/**
 * Deploy a self-destructing BatchFunder contract that distributes ETH
 * to all recipients in a single transaction.
 */
export async function batchFundAccounts(
  rpcUrl: string,
  privateKey: Hex,
  accounts: readonly { address: Hex }[],
  amountEach: bigint,
): Promise<void> {
  const addresses = accounts.map((a) => getAddress(a.address));

  const encodedArgs = encodeAbiParameters(
    [
      { type: 'address[]', name: 'recipients' },
      { type: 'uint256', name: 'amountEach' },
    ],
    [addresses, amountEach],
  );

  const data = (BATCH_FUNDER_BYTECODE + encodedArgs.slice(2)) as Hex;

  const client = createNodeClient(rpcUrl, privateKey);
  const txHash = await client.sendTransaction({
    data,
    value: amountEach * BigInt(accounts.length),
    chain: null,
  });

  await getTransactionReceipt(rpcUrl, txHash);
}
