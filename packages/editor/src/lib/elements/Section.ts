export function isSection(text: string): boolean {
  return /^#+\s*\S/.test(text.trim());
}
