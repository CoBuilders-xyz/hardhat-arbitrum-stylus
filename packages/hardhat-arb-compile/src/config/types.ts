/**
 * User-provided configuration for Stylus compilation.
 * All fields are optional and will use defaults if not provided.
 */
export interface StylusCompileUserConfig {
  /** Use host Rust toolchain instead of Docker container (default: false) */
  useHostToolchain?: boolean;
}

/**
 * Resolved configuration for Stylus compilation.
 * All fields are required after resolution.
 */
export interface StylusCompileConfig {
  /** Use host Rust toolchain instead of Docker container */
  useHostToolchain: boolean;
}
