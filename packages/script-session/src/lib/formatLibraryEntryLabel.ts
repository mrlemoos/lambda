export function formatRelativeEditedAt(
  updatedAtMs: number,
  referenceMs: number,
): string {
  const elapsedMs = Math.max(0, referenceMs - updatedAtMs);
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);

  if (elapsedMinutes < 1) {
    return 'just now';
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? '' : 's'} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);

  return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`;
}

export function formatLibraryEntryLabel(
  displayName: string,
  updatedAtMs: number,
  referenceMs: number,
): string {
  return `${displayName} · ${formatRelativeEditedAt(updatedAtMs, referenceMs)}`;
}
