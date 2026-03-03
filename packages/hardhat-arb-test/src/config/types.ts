/**
 * User-provided configuration for arb:test.
 * All fields are optional and will use defaults if not provided.
 */
export interface StylusTestUserConfig {
  /** Use host Rust toolchain instead of Docker for Stylus tests (default: false) */
  useHostToolchain?: boolean;
}

/**
 * Resolved configuration for arb:test.
 * All fields are required after resolution.
 */
export interface StylusTestConfig {
  /** Use host Rust toolchain instead of Docker for Stylus tests */
  useHostToolchain: boolean;
}
