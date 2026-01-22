/**
 * Error utilities for hardhat-arbitrum-stylus plugins.
 *
 * Uses HardhatPluginError as recommended by Hardhat for community plugins.
 */
import { HardhatPluginError } from "hardhat/plugins";

const PLUGIN_ID = "@cobuilders/hardhat-arbitrum-stylus";

/**
 * Creates a HardhatPluginError with the plugin ID pre-configured.
 *
 * @param message - The error message
 * @param cause - Optional parent error for error chaining
 * @returns A HardhatPluginError instance
 */
export function createPluginError(
  message: string,
  cause?: Error,
): HardhatPluginError {
  return new HardhatPluginError(PLUGIN_ID, message, cause);
}

export { HardhatPluginError };
