export function isDirty(savedText: string, currentText: string): boolean {
  return savedText !== currentText;
}
