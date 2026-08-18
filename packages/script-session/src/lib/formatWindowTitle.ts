export function formatWindowTitle(options: {
  fileName: string | null;
  isDirty: boolean;
}): string {
  const baseName = options.fileName ?? 'Untitled';
  const dirtySuffix = options.isDirty ? ' • Edited' : '';

  return `${baseName}${dirtySuffix} — Lambda`;
}
