import { exec, spawn } from 'node:child_process';
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

/** Callback for progress updates during command execution */
export type ProgressCallback = (line: string) => void;

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

/**
 * Execute a shell command with progress updates.
 * Streams output and calls onProgress with the last non-empty line.
 *
 * @param command - The command to execute
 * @param options - Optional execution options
 * @param onProgress - Callback called with the last line of output
 * @returns Promise with stdout and stderr
 */
export async function execWithProgress(
  command: string,
  options?: ExecOptions,
  onProgress?: ProgressCallback,
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd: options?.cwd,
      env: options?.env ?? process.env,
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout += text;

      if (onProgress) {
        // Get the last non-empty line from the output
        const lines = text.split('\n').filter((line) => line.trim());
        if (lines.length > 0) {
          onProgress(lines[lines.length - 1].trim());
        }
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;

      if (onProgress) {
        // Also report progress from stderr (cargo outputs to stderr)
        const lines = text.split('\n').filter((line) => line.trim());
        if (lines.length > 0) {
          onProgress(lines[lines.length - 1].trim());
        }
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      } else {
        const error = new Error(`Command failed with exit code ${code}`);
        (error as Error & { stderr: string }).stderr = stderr.trim();
        reject(error);
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
