const validatedToolchainSets = new Set<string>();

export function getToolchainSetCacheKey(toolchains: readonly string[]): string {
  return [...new Set(toolchains.map((toolchain) => toolchain.trim()))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join(',');
}

export function hasValidatedToolchainSet(cacheKey: string): boolean {
  return validatedToolchainSets.has(cacheKey);
}

export function markValidatedToolchainSet(cacheKey: string): void {
  validatedToolchainSets.add(cacheKey);
}

export function clearValidatedToolchainSetCache(): void {
  validatedToolchainSets.clear();
}
