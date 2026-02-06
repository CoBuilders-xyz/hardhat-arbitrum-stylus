import { DockerClient } from '@cobuilders/hardhat-arb-utils';

/** Image name for Stylus compile containers */
const COMPILE_IMAGE_NAME = 'stylus-compile';

/**
 * Generate a Dockerfile content for a specific Rust toolchain.
 * The image will have Rust, wasm32 target, and cargo-stylus installed.
 */
function generateDockerfile(toolchain: string): string {
  return `FROM rust:${toolchain}-slim
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
RUN rustup target add wasm32-unknown-unknown
RUN cargo install cargo-stylus
WORKDIR /workspace
`;
}

/**
 * Get the full image name for a toolchain.
 */
export function getCompileImageName(toolchain: string): string {
  return `${COMPILE_IMAGE_NAME}:${toolchain}`;
}

/**
 * Check if a compile image exists for the given toolchain.
 */
export async function compileImageExists(toolchain: string): Promise<boolean> {
  const client = new DockerClient();
  return client.imageExists(COMPILE_IMAGE_NAME, toolchain);
}

/**
 * Build a compile image for the given toolchain if it doesn't exist.
 * Returns true if image was built, false if it already existed.
 */
export async function ensureCompileImage(
  toolchain: string,
  onProgress?: (message: string) => void,
): Promise<boolean> {
  const client = new DockerClient();

  // Check if image already exists
  const exists = await client.imageExists(COMPILE_IMAGE_NAME, toolchain);
  if (exists) {
    return false;
  }

  onProgress?.(
    `Building compile image for toolchain ${toolchain}... (this may take several minutes)`,
  );

  // Generate and build the Dockerfile
  const dockerfile = generateDockerfile(toolchain);
  await client.buildImage(
    COMPILE_IMAGE_NAME,
    toolchain,
    dockerfile,
    onProgress,
  );

  onProgress?.(`Compile image ${COMPILE_IMAGE_NAME}:${toolchain} ready.`);

  return true;
}

/**
 * Build compile images for multiple toolchains.
 * Skips toolchains that already have images.
 */
export async function ensureCompileImages(
  toolchains: string[],
  onProgress?: (message: string) => void,
): Promise<{ built: string[]; cached: string[] }> {
  const built: string[] = [];
  const cached: string[] = [];

  for (const toolchain of toolchains) {
    const wasBuilt = await ensureCompileImage(toolchain, onProgress);
    if (wasBuilt) {
      built.push(toolchain);
    } else {
      cached.push(toolchain);
    }
  }

  return { built, cached };
}
