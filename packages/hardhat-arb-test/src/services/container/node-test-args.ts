export interface NodeTestArgOptions {
  only: boolean;
  grep: string | undefined;
}

export function buildNodeTestArgs(
  files: readonly string[],
  opts: NodeTestArgOptions,
): string[] {
  return [
    '--test',
    '--test-concurrency=1',
    '--test-reporter=spec',
    ...(opts.only ? ['--test-only'] : []),
    ...(opts.grep ? [`--test-name-pattern=${opts.grep}`] : []),
    ...files,
  ];
}
