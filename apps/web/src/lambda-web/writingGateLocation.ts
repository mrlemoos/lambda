import type { WritingAccess } from '@lambda/auth';

export function writingGateLocation(
  writingAccess: WritingAccess,
): string | null {
  if (writingAccess === 'write') {
    return null;
  }

  if (writingAccess === 'sign-in-wall') {
    return '/sign-in';
  }

  return '/';
}
