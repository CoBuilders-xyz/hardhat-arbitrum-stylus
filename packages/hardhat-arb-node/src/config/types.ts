/**
 * User-provided configuration for the Arbitrum node.
 * All fields are optional and will use defaults if not provided.
 */
export interface ArbNodeUserConfig {
  /** Docker image name (default: "offchainlabs/nitro-node") */
  image?: string;
  /** Image tag/version (default: "v3.7.1-926f1ab") */
  tag?: string;
  /** HTTP RPC port on host (default: 8547) */
  httpPort?: number;
  /** WebSocket port on host (default: 8548) */
  wsPort?: number;
}

/**
 * Resolved configuration for the Arbitrum node.
 * All fields are required after resolution.
 */
export interface ArbNodeConfig {
  /** Docker image name */
  image: string;
  /** Image tag/version */
  tag: string;
  /** HTTP RPC port on host */
  httpPort: number;
  /** WebSocket port on host */
  wsPort: number;
}
