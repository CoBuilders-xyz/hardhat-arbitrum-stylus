/**
 * Container configuration types for Docker container lifecycle management.
 */

/**
 * Port mapping between host and container.
 */
export interface PortMapping {
  /** Port on the host machine */
  host: number;
  /** Port inside the container */
  container: number;
  /** Protocol (tcp or udp), defaults to tcp */
  protocol?: "tcp" | "udp";
}

/**
 * Volume mapping between host and container.
 */
export interface VolumeMapping {
  /** Path on the host machine */
  host: string;
  /** Path inside the container */
  container: string;
  /** Read-only mount */
  readonly?: boolean;
}

/**
 * Readiness check configuration to verify container is ready.
 */
export interface ReadinessCheck {
  /**
   * Type of readiness check:
   * - http: Poll HTTP endpoint until successful response
   * - tcp: Check if TCP port is open
   * - exec: Run command inside container
   */
  type: "http" | "tcp" | "exec";
  /**
   * Target for the check:
   * - For http: full URL (e.g., "http://localhost:8547")
   * - For tcp: "host:port" (e.g., "localhost:8547")
   * - For exec: command to run (e.g., "echo ready")
   */
  target: string;
  /** Timeout in milliseconds before giving up */
  timeout: number;
  /** Interval in milliseconds between check attempts */
  interval: number;
}

/**
 * Configuration for starting a container.
 */
export interface ContainerConfig {
  /** Docker image name (e.g., "offchainlabs/nitro-node") */
  image: string;
  /** Image tag/version (e.g., "v3.7.1-926f1ab") */
  tag: string;
  /** Container name (optional, Docker will generate one if not provided) */
  name?: string;
  /** Port mappings */
  ports?: PortMapping[];
  /** Environment variables */
  env?: Record<string, string>;
  /** Volume mappings */
  volumes?: VolumeMapping[];
  /** Command line arguments to pass to the container */
  command?: string[];
  /** Readiness check to verify container is ready */
  readinessCheck?: ReadinessCheck;
  /** Remove container when it stops */
  autoRemove?: boolean;
  /** Run container in detached mode (background) */
  detach?: boolean;
  /** Docker network to connect the container to */
  network?: string;
}

/**
 * Container status.
 */
export type ContainerStatus =
  | "running"
  | "stopped"
  | "exited"
  | "created"
  | "unknown";

/**
 * Information about a running container.
 */
export interface ContainerInfo {
  /** Container ID */
  id: string;
  /** Container name */
  name: string;
  /** Port mappings */
  ports: PortMapping[];
  /** Current container status */
  status: ContainerStatus;
  /** Image used */
  image: string;
  /** Image tag */
  tag: string;
}

/**
 * Result of executing a command inside a container.
 */
export interface ExecResult {
  /** Exit code of the command */
  exitCode: number;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
}
