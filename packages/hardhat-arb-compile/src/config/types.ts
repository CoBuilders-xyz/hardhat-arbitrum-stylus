/**
 * User-provided configuration for Stylus compilation.
 * All fields are optional and will use defaults if not provided.
 */
export interface StylusCompileUserConfig {
  /** Use local Rust toolchain instead of Docker container (default: false) */
  useLocalRust?: boolean;
}

/**
 * Resolved configuration for Stylus compilation.
 * All fields are required after resolution.
 */
export interface StylusCompileConfig {
  /** Use local Rust toolchain instead of Docker container */
  useLocalRust: boolean;
}
