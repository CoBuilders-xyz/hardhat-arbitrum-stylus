import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

export interface ExecOptions {
  /** Working directory for the command */
  cwd?: string;
  /** Environment variables */
  env?: NodeJS.ProcessEnv;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
}

/**
 * Execute a shell command asynchronously.
 *
 * @param command - The command to execute
 * @param options - Optional execution options
 * @returns Promise with stdout and stderr
 */
export async function execAsync(
  command: string,
  options?: ExecOptions,
): Promise<ExecResult> {
  const { stdout, stderr } = await execPromise(command, {
    cwd: options?.cwd,
    env: options?.env ?? process.env,
    timeout: options?.timeout,
  });

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}
