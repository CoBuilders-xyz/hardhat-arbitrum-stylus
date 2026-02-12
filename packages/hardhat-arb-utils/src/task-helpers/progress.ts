/**
 * Clear the current line and write new content.
 * Uses carriage return to overwrite the line for progress updates.
 */
export function writeProgress(line: string): void {
  const maxWidth = process.stdout.columns || 80;
  // Truncate long lines to fit terminal width
  const content = `    ${line}`;
  const truncated =
    content.length > maxWidth
      ? content.slice(0, maxWidth - 3) + '...'
      : content;
  // Pad with spaces to clear any previous longer content
  const padded = truncated.padEnd(maxWidth, ' ');
  process.stdout.write(`\r${padded}`);
}

/**
 * Clear the progress line.
 */
export function clearProgress(): void {
  const width = process.stdout.columns || 80;
  process.stdout.write('\r' + ' '.repeat(width) + '\r');
}
