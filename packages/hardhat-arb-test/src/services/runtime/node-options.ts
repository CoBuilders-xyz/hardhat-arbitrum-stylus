let cachedTsxImportHref: string | undefined;

async function getTsxImportHref(): Promise<string> {
  if (cachedTsxImportHref !== undefined) {
    return cachedTsxImportHref;
  }

  cachedTsxImportHref = new URL(import.meta.resolve('tsx/esm')).href;
  return cachedTsxImportHref;
}

export function appendImportToNodeOptions(
  existing: string | undefined,
  importHref: string,
): string {
  const current = (existing ?? '').trim();
  if (
    current.includes(importHref) ||
    (current.includes('--import') && current.includes('tsx/esm'))
  ) {
    return current;
  }

  return `${current} --import "${importHref}"`.trim();
}

export async function buildNodeOptionsWithTsxImport(
  existing: string | undefined,
): Promise<string> {
  return appendImportToNodeOptions(existing, await getTsxImportHref());
}

export function clearNodeOptionsCacheForTests(): void {
  cachedTsxImportHref = undefined;
}
