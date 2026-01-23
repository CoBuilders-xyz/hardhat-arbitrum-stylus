/**
 * Low-level JSON-RPC utilities for web3 interactions.
 */

import { keccak256, type Hex } from "viem";

import { createPluginError } from "../errors/index.js";

/**
 * Send a raw signed transaction via JSON-RPC.
 */
export async function sendRawTransaction(
  rpcUrl: string,
  signedTx: Hex,
): Promise<Hex> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: [signedTx],
      id: 1,
    }),
  });

  const result = (await response.json()) as { result?: Hex; error?: unknown };
  if (!result.result) {
    throw createPluginError(
      `Failed to send raw transaction: ${JSON.stringify(result.error)}`,
    );
  }

  return result.result;
}

/**
 * Get contract code at an address via JSON-RPC.
 */
export async function getCode(rpcUrl: string, address: Hex): Promise<Hex> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getCode",
      params: [address, "latest"],
      id: 1,
    }),
  });

  const result = (await response.json()) as { result: Hex };
  return result.result;
}

/**
 * Get transaction receipt via JSON-RPC.
 */
export async function getTransactionReceipt(
  rpcUrl: string,
  txHash: Hex,
): Promise<{ status: Hex; contractAddress?: Hex } | null> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [txHash],
      id: 1,
    }),
  });

  const result = (await response.json()) as {
    result: { status: Hex; contractAddress?: Hex } | null;
  };

  return result.result;
}

/**
 * Wait for a transaction receipt with timeout.
 */
export async function waitForReceipt(
  rpcUrl: string,
  txHash: Hex,
  timeout: number = 30000,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const receipt = await getTransactionReceipt(rpcUrl, txHash);

    if (receipt) {
      return receipt.status === "0x1";
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

/**
 * Compute CREATE2 address from factory, salt, and init code.
 */
export function computeCreate2Address(
  factory: Hex,
  salt: Hex,
  initCode: Hex,
): Hex {
  const initCodeHash = keccak256(initCode);
  const data = ("0xff" +
    factory.slice(2) +
    salt.slice(2) +
    initCodeHash.slice(2)) as Hex;
  const hash = keccak256(data);
  return ("0x" + hash.slice(-40)) as Hex;
}
