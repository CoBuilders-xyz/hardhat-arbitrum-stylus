/**
 * Information about a discovered Stylus contract.
 */
export interface StylusContractInfo {
  /** Package name from Cargo.toml */
  name: string;
  /** Absolute path to contract directory */
  path: string;
  /** Rust toolchain version from rust-toolchain.toml */
  toolchain: string;
}

/**
 * Options for contract discovery.
 */
export interface DiscoveryOptions {
  /** Filter to specific contract names */
  contracts?: string[];
}
