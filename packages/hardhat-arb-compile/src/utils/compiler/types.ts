/**
 * Result of a Stylus contract compilation.
 */
export interface CompileResult {
  /** Path to the compiled WASM file */
  wasmPath: string;
  /** Whether compilation succeeded */
  success: boolean;
  /** Path to the generated artifact JSON (if artifactsDir was provided) */
  artifactPath?: string;
}
