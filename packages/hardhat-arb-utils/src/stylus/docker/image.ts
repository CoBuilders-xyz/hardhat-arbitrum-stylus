import { DockerClient } from '../../container/docker-client.js';

/** Image name for Stylus compile containers */
const COMPILE_IMAGE_NAME = 'stylus-compile';

/** Tag for the base image (uses latest Rust) */
const COMPILE_IMAGE_TAG = 'latest';

/**
 * Generate a Dockerfile for the base compile image.
 * Uses the latest Rust version to install cargo-stylus, then specific
 * toolchains are installed at runtime for each contract.
 */
function generateDockerfile(): string {
  return `FROM rust:slim
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
RUN rustup target add wasm32-unknown-unknown
RUN cargo install cargo-stylus
WORKDIR /workspace
`;
}

/**
 * Get the full image name for the compile image.
 */
export function getCompileImageName(): string {
  return `${COMPILE_IMAGE_NAME}:${COMPILE_IMAGE_TAG}`;
}

/**
 * Check if the base compile image exists.
 */
export async function compileImageExists(): Promise<boolean> {
  const client = new DockerClient();
  return client.imageExists(COMPILE_IMAGE_NAME, COMPILE_IMAGE_TAG);
}

/**
 * Build the base compile image if it doesn't exist.
 * Returns true if image was built, false if it already existed.
 */
export async function ensureCompileImage(
  onProgress?: (message: string) => void,
): Promise<boolean> {
  const client = new DockerClient();

  // Check if image already exists
  const exists = await client.imageExists(
    COMPILE_IMAGE_NAME,
    COMPILE_IMAGE_TAG,
  );
  if (exists) {
    onProgress?.(
      `Using cached compile image ${COMPILE_IMAGE_NAME}:${COMPILE_IMAGE_TAG}`,
    );
    return false;
  }

  onProgress?.(
    `Building compile image... (this may take several minutes on first run)`,
  );

  // Generate and build the Dockerfile
  const dockerfile = generateDockerfile();
  await client.buildImage(
    COMPILE_IMAGE_NAME,
    COMPILE_IMAGE_TAG,
    dockerfile,
    onProgress,
  );

  onProgress?.(
    `Compile image ${COMPILE_IMAGE_NAME}:${COMPILE_IMAGE_TAG} ready.`,
  );

  return true;
}
