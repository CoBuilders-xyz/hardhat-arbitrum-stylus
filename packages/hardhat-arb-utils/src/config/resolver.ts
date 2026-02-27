/**
 * Generic resolver for Stylus sub-config sections.
 *
 * Merges user-provided values with defaults, using ?? for each key.
 *
 * @param userConfig - Partial user config (may be undefined)
 * @param defaults - Full defaults object with all required fields
 * @returns Resolved config with all fields filled
 */
export function resolveStylusSubConfig<
  TResolved extends object,
  TUser extends Partial<TResolved>,
>(userConfig: TUser | undefined, defaults: TResolved): TResolved {
  if (!userConfig) return { ...defaults };

  const resolved = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof TResolved>) {
    const userValue = (userConfig as Partial<TResolved>)[key];
    if (userValue !== undefined) {
      resolved[key] = userValue as TResolved[keyof TResolved];
    }
  }
  return resolved;
}
