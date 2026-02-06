import { execWithProgress, type ProgressCallback } from '../exec.js';

/**
 * Export ABI from a Stylus contract using cargo stylus export-abi.
 *
 * @param contractPath - Absolute path to the contract directory
 * @param toolchain - The Rust toolchain version (e.g., "1.93.0")
 * @param onProgress - Optional callback for progress updates
 * @returns The Solidity interface string
 */
export async function exportStylusAbi(
  contractPath: string,
  toolchain: string,
  onProgress?: ProgressCallback,
): Promise<string> {
  try {
    const { stdout } = await execWithProgress(
      `cargo +${toolchain} stylus export-abi`,
      { cwd: contractPath },
      onProgress,
    );
    return stdout;
  } catch {
    // If export-abi fails, it might be because the contract doesn't have
    // the required main.rs with export-abi feature. Return empty string.
    return '';
  }
}

/**
 * Parse a Solidity interface into JSON ABI format.
 *
 * This is a simplified parser that handles the output of cargo stylus export-abi.
 * It extracts function signatures from the interface definition.
 *
 * @param solidityInterface - The Solidity interface string
 * @returns JSON ABI array
 */
export function parseAbiFromSolidity(solidityInterface: string): unknown[] {
  const abi: unknown[] = [];

  if (!solidityInterface || solidityInterface.trim() === '') {
    return abi;
  }

  // Extract function definitions from the interface
  // Matches: function name(params) external view/pure returns (type);
  const functionRegex =
    /function\s+(\w+)\s*\(([^)]*)\)\s*(external|public)?\s*(view|pure|payable)?\s*(returns\s*\(([^)]*)\))?/g;

  let match;
  while ((match = functionRegex.exec(solidityInterface)) !== null) {
    const [, name, inputParams, , stateMutability, , outputParams] = match;

    const inputs = parseParams(inputParams);
    const outputs = outputParams ? parseParams(outputParams) : [];

    const abiEntry: {
      type: string;
      name: string;
      inputs: unknown[];
      outputs: unknown[];
      stateMutability: string;
    } = {
      type: 'function',
      name,
      inputs,
      outputs,
      stateMutability: stateMutability || 'nonpayable',
    };

    abi.push(abiEntry);
  }

  // Extract event definitions
  // Matches: event Name(params);
  const eventRegex = /event\s+(\w+)\s*\(([^)]*)\)/g;

  while ((match = eventRegex.exec(solidityInterface)) !== null) {
    const [, name, params] = match;
    const inputs = parseEventParams(params);

    abi.push({
      type: 'event',
      name,
      inputs,
      anonymous: false,
    });
  }

  return abi;
}

/**
 * Parse function parameters into ABI format.
 */
function parseParams(params: string): unknown[] {
  if (!params || params.trim() === '') {
    return [];
  }

  const result: unknown[] = [];
  const paramList = params.split(',').map((p) => p.trim());

  for (let i = 0; i < paramList.length; i++) {
    const param = paramList[i];
    if (!param) continue;

    // Handle complex types like arrays and mappings
    const parts = param.split(/\s+/);

    // Last part might be the name if present
    let type = parts[0];
    let name = '';

    if (parts.length > 1) {
      // Check if last part is a memory/calldata modifier or a name
      const lastPart = parts[parts.length - 1];
      if (lastPart !== 'memory' && lastPart !== 'calldata') {
        name = lastPart;
        // Type is everything except the last part
        type = parts
          .slice(0, -1)
          .filter((p) => p !== 'memory' && p !== 'calldata')
          .join(' ');
      } else {
        type = parts
          .filter((p) => p !== 'memory' && p !== 'calldata')
          .join(' ');
      }
    }

    result.push({
      name: name || `arg${i}`,
      type: normalizeType(type),
      internalType: type,
    });
  }

  return result;
}

/**
 * Parse event parameters into ABI format.
 */
function parseEventParams(params: string): unknown[] {
  if (!params || params.trim() === '') {
    return [];
  }

  const result: unknown[] = [];
  const paramList = params.split(',').map((p) => p.trim());

  for (let i = 0; i < paramList.length; i++) {
    const param = paramList[i];
    if (!param) continue;

    const indexed = param.includes('indexed');
    const parts = param.replace('indexed', '').trim().split(/\s+/);

    const type = parts[0];
    const name = parts.length > 1 ? parts[parts.length - 1] : `arg${i}`;

    result.push({
      name,
      type: normalizeType(type),
      indexed,
      internalType: type,
    });
  }

  return result;
}

/**
 * Normalize Solidity types to standard ABI types.
 */
function normalizeType(type: string): string {
  // Handle common type aliases
  const typeMap: Record<string, string> = {
    uint: 'uint256',
    int: 'int256',
  };

  return typeMap[type] || type;
}
