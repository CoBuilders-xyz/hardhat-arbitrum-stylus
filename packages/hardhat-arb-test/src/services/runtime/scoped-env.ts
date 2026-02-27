export type ScopedEnvUpdates = Readonly<
  Record<string, string | null | undefined>
>;

/**
 * Temporarily applies environment variable updates and restores prior values.
 */
export async function withScopedEnv<T>(
  updates: ScopedEnvUpdates,
  fn: () => Promise<T> | T,
): Promise<T> {
  const previousValues = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(updates)) {
    previousValues.set(key, process.env[key]);

    if (value === undefined) continue;

    if (value === null) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }

  try {
    return await fn();
  } finally {
    for (const [key, previousValue] of previousValues) {
      if (previousValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previousValue;
      }
    }
  }
}
