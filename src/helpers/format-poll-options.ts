/**
 * Formats poll options into a formatted description string.
 * @param options - Array of poll options
 * @returns Formatted description with emojis and options
 */
export function formatPollOptions(options: string[], emojis: string[]): string {
  return `### Options:\n${options
    .map((option, index) => `${emojis[index]} ${option}`)
    .join("\n")}`;
}
