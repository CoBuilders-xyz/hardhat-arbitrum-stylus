/**
 * User-provided configuration for Stylus deployment.
 * All fields are optional and will use defaults if not provided.
 */
export interface StylusDeployUserConfig {
  /** Use host Rust toolchain instead of Docker container (default: false) */
  useHostToolchain?: boolean;
}

/**
 * Resolved configuration for Stylus deployment.
 * All fields are required after resolution.
 */
export interface StylusDeployConfig {
  /** Use host Rust toolchain instead of Docker container */
  useHostToolchain: boolean;
}
