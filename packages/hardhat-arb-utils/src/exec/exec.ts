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

interface LineForwarder {
  push(text: string): void;
  flush(): void;
}

function createLineForwarder(onProgress?: ProgressCallback): LineForwarder {
  let pending = '';

  return {
    push(text: string) {
      if (!onProgress) return;

      pending += text;

      let newlineIndex = pending.indexOf('\n');
      while (newlineIndex !== -1) {
        const line = pending.slice(0, newlineIndex).trim();
        if (line) {
          onProgress(line);
        }
        pending = pending.slice(newlineIndex + 1);
        newlineIndex = pending.indexOf('\n');
      }
    },
    flush() {
      if (!onProgress) return;

      const line = pending.trim();
      if (line) {
        onProgress(line);
      }
      pending = '';
    },
  };
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
    const child = spawn(command, {
      cwd: options?.cwd,
      env: options?.env ?? process.env,
      shell: true,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const stdoutLines = createLineForwarder(onProgress);
    const stderrLines = createLineForwarder(onProgress);

    const timeout =
      options?.timeout && options.timeout > 0 ? options.timeout : undefined;
    const timeoutId =
      timeout === undefined
        ? undefined
        : setTimeout(() => {
            timedOut = true;
            child.kill('SIGTERM');
          }, timeout);

    child.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout += text;
      stdoutLines.push(text);
    });

    child.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      stderrLines.push(text);
    });

    child.on('close', (code) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      stdoutLines.flush();
      stderrLines.flush();

      if (code === 0) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      } else {
        const message =
          timedOut && timeout !== undefined
            ? `Command timed out after ${timeout}ms`
            : `Command failed with exit code ${code}`;
        const error = new Error(message);
        (error as Error & { stderr: string }).stderr = stderr.trim();
        reject(error);
      }
    });

    child.on('error', (error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      reject(error);
    });
  });
}
